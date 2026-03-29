import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Truck, User, Save, MapPin } from 'lucide-react';

export default function GeradorRomaneio({ onPrint }: any) {
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [motorista, setMotorista] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [aproveitamento, setAproveitamento] = useState('Bom');
  const [observacao, setObservacao] = useState('');
  const [linkMaps, setLinkMaps] = useState('');

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/fila');
      const data = await res.json();
      setPendentes(data.filter((t: any) => t.status === 'Pendente'));
    } catch (e) { console.error(e) }
  };

  useEffect(() => {
    loadTickets();
    fetch('/api/motoristas').then(r => r.json()).then(d => { setMotoristas(d); if(d.length > 0) setMotorista(d[0].nome); });
    fetch('/api/veiculos').then(r => r.json()).then(d => { setVeiculos(d); if(d.length > 0) setVeiculo(`${d[0].modelo} (${d[0].placa})`); });
  }, []);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(pendentes.map(p => p.id));
    else setSelectedIds([]);
  };

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* Esquerda: Lista de Pedidos */}
      <div className="glass-panel" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <LayoutDashboard size={24} color="var(--accent)" /> Montagem da Carga
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
              Selecione os pedidos da Fila de Espera para montar a viagem.
            </p>
          </div>
          <span style={{ fontSize: '14px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
            {selectedIds.length} selecionados
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: 'rgba(0,0,0,0.4)' }}>
              <tr>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === pendentes.length && pendentes.length > 0} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
                </th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Ticket Glpi</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Pedido</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Cliente</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Cidade/UF</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map((p) => {
                 const isSelected = selectedIds.includes(p.id);
                 return (
                  <tr key={p.id} onClick={() => handleToggle(p.id)} style={{ background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => handleToggle(p.id)} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'white' }}>{p.ticket_glpi}</td>
                    <td style={{ padding: '16px' }}>{p.pedido}</td>
                    <td style={{ padding: '16px' }}>{p.cliente}</td>
                    <td style={{ padding: '16px' }}>{p.cidade}</td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direita: Fechamento da Carga */}
      <div className="glass-panel" style={{ flex: 1, padding: '24px', position: 'sticky', top: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          Fechamento da Carga
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}><User size={16} /> Motorista Responsável</label>
             <select value={motorista} onChange={(e) => setMotorista(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#1e293b', color: 'white', outline: 'none' }}>
               {motoristas.length === 0 && <option value="">Nenhum motorista cadastrado</option>}
               {motoristas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
             </select>
           </div>
           
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}><Truck size={16} /> Veículo</label>
             <select value={veiculo} onChange={(e) => setVeiculo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#1e293b', color: 'white', outline: 'none' }}>
               {veiculos.length === 0 && <option value="">Nenhum veículo cadastrado</option>}
               {veiculos.map(v => <option key={v.id} value={`${v.modelo} (${v.placa})`}>{v.modelo} ({v.placa})</option>)}
             </select>
           </div>

           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Aproveitamento</label>
             <select value={aproveitamento} onChange={(e) => setAproveitamento(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#1e293b', color: 'white', outline: 'none' }}>
               <option value="Bom">Bom (Total)</option>
               <option value="Médio">Médio</option>
               <option value="Ruim">Ruim (Parcial)</option>
             </select>
           </div>
           
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Observações</label>
             <textarea rows={3} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Orientações críticas para a viagem..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', resize: 'none' }} />
           </div>
           
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#10b981', marginBottom: '8px' }}><MapPin size={16} /> Link do Google Maps (Gerar QRCode)</label>
             <input type="url" value={linkMaps} onChange={(e) => setLinkMaps(e.target.value)} placeholder="https://maps.app.goo.gl/..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.05)', color: 'white', outline: 'none' }} />
           </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
             onClick={async () => {
                const id_romaneio = `ROM-${new Date().getFullYear()}-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`;
                const chosenTickets = pendentes.filter(p => selectedIds.includes(p.id)).map(p => ({ ticket: p.ticket_glpi, pedido: p.pedido, cliente: p.cliente, cidade: p.cidade }));
                
                // printPayload usa 'id' para o componente de Impressão
                const printPayload = { id: id_romaneio, data: new Date().toLocaleDateString('pt-BR'), motorista, veiculo, aproveitamento, observacoes: observacao, link_maps: linkMaps, tickets: chosenTickets };
                
                // apiPayload usa 'id_romaneio' que é o nome da coluna no banco
                const apiPayload = { id_romaneio, motorista, veiculo, aproveitamento, observacoes: observacao, link_maps: linkMaps, tickets: chosenTickets };

                try {
                    const resp = await fetch('/api/romaneios', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiPayload)
                    });
                    if (!resp.ok) {
                       const err = await resp.json();
                       alert('Erro ao salvar romaneio: ' + err.error);
                       return;
                    }
                } catch(e) {
                    alert('Falha de conexão ao salvar romaneio.');
                    return;
                }
                
                onPrint(printPayload);
                setSelectedIds([]);
                loadTickets();
             }}
             style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: selectedIds.length === 0 ? 0.5 : 1, transition: 'all 0.2s' }} disabled={selectedIds.length === 0}>
            <Save size={18} /> GERAR E IMPRIMIR ROMANEIO
          </button>
        </div>
      </div>
    </div>
  );
}
