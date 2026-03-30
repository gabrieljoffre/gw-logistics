import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3001;

// Configuração do GLPI via Variáveis de Ambiente
const GLPI_CONFIG = {
    host: process.env.GLPI_HOST || '172.21.10.23',
    port: Number(process.env.GLPI_PORT) || 3306,
    user: process.env.GLPI_USER,
    password: process.env.GLPI_PASSWORD,
    database: process.env.GLPI_DATABASE || 'glpidb'
};

// Conexão com Supabase PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS fila_espera (
            id SERIAL PRIMARY KEY,
            ticket_glpi TEXT UNIQUE,
            pedido TEXT,
            tipo_venda TEXT,
            cliente TEXT,
            cidade TEXT,
            data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Pendente'
        );
        CREATE TABLE IF NOT EXISTS romaneios (
            id_romaneio TEXT PRIMARY KEY,
            motorista TEXT,
            veiculo TEXT,
            aproveitamento TEXT,
            observacoes TEXT,
            link_maps TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Criado'
        );
        CREATE TABLE IF NOT EXISTS romaneio_items (
            id_romaneio TEXT,
            ticket_glpi TEXT,
            FOREIGN KEY(id_romaneio) REFERENCES romaneios(id_romaneio)
        );
        CREATE TABLE IF NOT EXISTS erros_logisticos (
            id SERIAL PRIMARY KEY,
            romaneio TEXT,
            ticket TEXT,
            responsavel TEXT,
            descricao TEXT,
            status TEXT,
            valor NUMERIC(10,2),
            tipo TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS motoristas (
            id SERIAL PRIMARY KEY,
            nome TEXT,
            cnh TEXT,
            status TEXT DEFAULT 'Ativo'
        );
        CREATE TABLE IF NOT EXISTS veiculos (
            id SERIAL PRIMARY KEY,
            placa TEXT,
            modelo TEXT,
            capacidade TEXT,
            status TEXT DEFAULT 'Operacional'
        );
    `);
    // Migrations para colunas que podem nao existir ainda nas tabelas antigas
    await pool.query(`ALTER TABLE romaneios ADD COLUMN IF NOT EXISTS link_maps TEXT;`);
    console.log('☁️ Supabase Cloud DB Initialized.');
}

// Extrator via Regex das descrições do GLPI
function parseGLPIForm(description: string) {
    // Busca baseada nos campos mencionados (2, 7, 8, 10 do formulário)
    const tipoVendaMatch = description.match(/2\)\s*Tipo de Venda\s*:\s*(.*)/);
    const pedidoMatch = description.match(/7\)\s*Pedido\s*:\s*(\d+)/);
    const clienteMatch = description.match(/8\)\s*Cod\. do cliente \/ Razão social\s*:\s*(.*)/);
    const cidadeMatch = description.match(/10\)\s*Qual é cidade de entrega\?\s*:\s*(.*)/);

    return {
        tipoVenda: tipoVendaMatch ? tipoVendaMatch[1].trim() : 'N/A',
        pedido: pedidoMatch ? pedidoMatch[1].trim() : 'N/A',
        cliente: clienteMatch ? clienteMatch[1].trim() : 'N/A',
        cidade: cidadeMatch ? cidadeMatch[1].trim() : 'N/A'
    };
}

// O Motor de Sincronização
async function syncFromGLPI() {
    console.log('🔄 Executando cronjob - Buscando GLPI...');
    try {
        const connection = await mysql.createConnection(GLPI_CONFIG);
        // Filtro fictício: assumindo que glpi_tickets a partir de 2026 com conteudo específico no glpi_itilfollowups
        // "Apenas tickets com a tag 'aguardando programação de entrega' criados a partir de 01/01/2026"
        const [rows] = await connection.execute<any[]>(`
            SELECT id, name, content, date_creation 
            FROM glpi_tickets 
            WHERE date_creation >= '2026-01-01'
            AND status NOT IN (5,6) -- Exemplo (Resolvido/Fechado)
        `);
        
        let inserted = 0;
        for (const ticket of rows) {
            // Faremos o regex no campo de descrição (content) onde o formulário é postado
            if (ticket.content && ticket.content.includes('aguardando programação de entrega')) {
                const parsedData = parseGLPIForm(ticket.content);
                
                // Regra de Proteção (Insert Ignore/Upsert baseado no ticket_glpi)
                const checkRes = await pool.query(`SELECT id FROM fila_espera WHERE ticket_glpi = $1`, [ticket.id.toString()]);
                const exists = checkRes.rows.length > 0;
                if (!exists) {
                    await pool.query(`
                        INSERT INTO fila_espera (ticket_glpi, pedido, tipo_venda, cliente, cidade)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [ticket.id.toString(), parsedData.pedido, parsedData.tipoVenda, parsedData.cliente, parsedData.cidade]);
                    inserted++;
                }
            }
        }
        await connection.end();
        console.log(`✅ Sincronização concluída. ${inserted} novos tickets adicionados.`);
    } catch (err: any) {
        console.error('❌ Falha na sincronização GLPI:', err.message);
    }
}

// Cronjob: A cada 1 minuto (Entre 07:30 e 18:30)
cron.schedule('* * * * *', () => {
    const d = new Date();
    const currentHour = d.getHours();
    const currentMin = d.getMinutes();
    const timeValue = currentHour * 60 + currentMin;

    const startWindow = 7 * 60 + 30; // 07:30
    const endWindow = 18 * 60 + 30;  // 18:30

    if (timeValue >= startWindow && timeValue <= endWindow) {
        syncFromGLPI();
    } else {
        console.log('⏰ Fora da janela de execução (07:30 - 18:30).');
    }
});

app.get('/api/fila', async (req, res) => {
    try {
        const { rows: tickets } = await pool.query("SELECT * FROM fila_espera WHERE status = 'Pendente' ORDER BY data_entrada DESC");
        res.json(tickets);
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/fila', async (req, res) => {
    const { ticket_glpi, pedido, tipo_venda, cliente, cidade } = req.body;
    try {
        await pool.query(`
            INSERT INTO fila_espera (ticket_glpi, pedido, tipo_venda, cliente, cidade)
            VALUES ($1, $2, $3, $4, $5)
        `, [ticket_glpi || 'MANUAL', pedido, tipo_venda || 'Manual', cliente, cidade]);
        res.json({ success: true });
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/romaneios', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, COUNT(ri.ticket_glpi) as pedidos 
            FROM romaneios r 
            LEFT JOIN romaneio_items ri ON r.id_romaneio = ri.id_romaneio 
            GROUP BY r.id_romaneio 
            ORDER BY r.data_criacao DESC
        `);
        res.json(rows);
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/romaneios', async (req, res) => {
    const { id_romaneio, motorista, veiculo, aproveitamento, observacoes, link_maps, tickets } = req.body;
    try {
        // Criar Romaneio
        await pool.query(`
            INSERT INTO romaneios (id_romaneio, motorista, veiculo, aproveitamento, observacoes, link_maps)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id_romaneio) DO NOTHING
        `, [id_romaneio, motorista, veiculo, aproveitamento, observacoes, link_maps]);

        // Inserir os tickets e remover da fila de espera
        for (const t of (tickets || [])) {
            await pool.query("INSERT INTO romaneio_items (id_romaneio, ticket_glpi) VALUES ($1, $2)", [id_romaneio, t.ticket]);
            await pool.query("UPDATE fila_espera SET status = 'Roteirizado' WHERE ticket_glpi = $1", [t.ticket]);
        }
        res.json({ success: true });
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/romaneios/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query("UPDATE romaneios SET status = $1 WHERE id_romaneio = $2", [status, req.params.id]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// Editar campos do romaneio (motorista, veiculo, link_maps)
app.put('/api/romaneios/:id', async (req, res) => {
    const { motorista, veiculo, link_maps } = req.body;
    try {
        await pool.query("UPDATE romaneios SET motorista=$1, veiculo=$2, link_maps=$3 WHERE id_romaneio=$4", [motorista, veiculo, link_maps, req.params.id]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// Itens de um romaneio (com dados do pedido)
app.get('/api/romaneios/:id/items', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT ri.ticket_glpi, fe.pedido, fe.cliente, fe.cidade
            FROM romaneio_items ri
            LEFT JOIN fila_espera fe ON fe.ticket_glpi = ri.ticket_glpi
            WHERE ri.id_romaneio = $1
        `, [req.params.id]);
        res.json(rows);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// Adicionar item ao romaneio
app.post('/api/romaneios/:id/items', async (req, res) => {
    const { ticket_glpi, pedido, cliente, cidade } = req.body;
    try {
        // insert into items
        await pool.query("INSERT INTO romaneio_items (id_romaneio, ticket_glpi) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.params.id, ticket_glpi]);
        // upsert fila_espera for manual items
        await pool.query(`INSERT INTO fila_espera (ticket_glpi, pedido, cliente, cidade, status) VALUES ($1,$2,$3,$4,'Roteirizado') ON CONFLICT(ticket_glpi) DO UPDATE SET status='Roteirizado'`, [ticket_glpi, pedido, cliente, cidade]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// Remover item do romaneio
app.delete('/api/romaneios/:id/items/:ticket', async (req, res) => {
    try {
        await pool.query("DELETE FROM romaneio_items WHERE id_romaneio=$1 AND ticket_glpi=$2", [req.params.id, req.params.ticket]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// Atualizar status de ticket na fila (para devolver pedidos removidos)
app.put('/api/fila/status/:ticket', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query("UPDATE fila_espera SET status=$1 WHERE ticket_glpi=$2", [status, req.params.ticket]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/erros', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM erros_logisticos ORDER BY id DESC");
        const parsed = rows.map(r => ({ ...r, valor: parseFloat(r.valor) }));
        res.json(parsed);
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/erros', async (req, res) => {
    const { romaneio, ticket, responsavel, descricao, status, valor, tipo } = req.body;
    try {
        await pool.query(`INSERT INTO erros_logisticos (romaneio, ticket, responsavel, descricao, status, valor, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [romaneio, ticket, responsavel, descricao, status, valor, tipo]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/erros/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query("UPDATE erros_logisticos SET status = $1 WHERE id = $2", [status, req.params.id]);
        res.json({ success: true });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
});

// === MOTORISTAS E VEICULOS ===
app.get('/api/motoristas', async (_req, res) => {
    try { const { rows } = await pool.query("SELECT * FROM motoristas ORDER BY id"); res.json(rows); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/motoristas', async (req, res) => {
    const { nome, cnh } = req.body;
    try { await pool.query("INSERT INTO motoristas (nome, cnh) VALUES ($1, $2)", [nome, cnh]); res.json({ success: true }); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/motoristas/:id', async (req, res) => {
    try { await pool.query("DELETE FROM motoristas WHERE id = $1", [req.params.id]); res.json({ success: true }); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/veiculos', async (_req, res) => {
    try { const { rows } = await pool.query("SELECT * FROM veiculos ORDER BY id"); res.json(rows); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/veiculos', async (req, res) => {
    const { placa, modelo, capacidade } = req.body;
    try { await pool.query("INSERT INTO veiculos (placa, modelo, capacidade) VALUES ($1, $2, $3)", [placa, modelo, capacidade]); res.json({ success: true }); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/veiculos/:id', async (req, res) => {
    try { await pool.query("DELETE FROM veiculos WHERE id = $1", [req.params.id]); res.json({ success: true }); }
    catch(e: any) { res.status(500).json({ error: e.message }); }
});

// === HOSPEDAGEM DO FRONTEND AQUI ===
// Garantia de caminho absoluto blindado
const frontendDist = path.join(process.cwd(), '../frontend/dist');
console.log('📦 Pasta do Frontend configurada para:', frontendDist);
app.use(express.static(frontendDist));

app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', async () => {
    await initDB();
    console.log(`🚀 Integrado Frontend+Backend Started on 0.0.0.0:${PORT}`);
    // Rodar a primeira vez ao ligar o server
    syncFromGLPI();
});
