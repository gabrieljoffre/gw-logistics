import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Plus, Check, X } from 'lucide-react';

export default function FilaEspera() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  
  const loadTickets = async () => {
    try {
      const res = await fetch('/api/fila');
      const data = await res.json();
      setTickets(data);
    } catch (e) { console.error('Error fetching tickets', e) }
  };

  useEffect(() => {
    loadTickets();
  }, []);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newPedido, setNewPedido] = useState('');
  const [newCliente, setNewCliente] = useState('Transferência Filial');
  const [newCidade, setNewCidade] = useState('');

  const handleSave = async () => {
    if(!newPedido || !newCidade) return setIsAdding(false);
    
    try {
        await fetch('/api/fila', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticket_glpi: `MANUAL-${Date.now()}`,
                pedido: newPedido,
                tipo_venda: 'Manual',
                cliente: newCliente,
                cidade: newCidade
            })
        });
        await loadTickets();
    } catch(e) { console.error(e) }

    setNewPedido(''); setNewCliente('Transferência Filial'); setNewCidade('');
    setIsAdding(false);
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Clock size={24} color="var(--accent)" /> Fila de Espera (Estoque de Trabalho)
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Pedidos integrados do GLPI e lançamentos manuais aguardando roteirização.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '10px', left: '12px' }} />
              <input 
                 type="text" 
                 placeholder="Buscar ticket ou cliente..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', width: '240px', outline: 'none' }}
              />
           </div>
           <button onClick={() => setIsAdding(true)} className="button-primary" style={{ background: '#10b981' }}>
             <Plus size={18} /> Novo Pedido Manual
           </button>
           <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
             <Filter size={18} /> Filtros
           </button>
        </div>
      </div>

      {isAdding && (
         <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Lançamento Manual de Pedido
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '16px', alignItems: 'end' }}>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nº do Pedido / NF</label>
                  <input autoFocus placeholder="12345..." value={newPedido} onChange={e => setNewPedido(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
               </div>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Cliente ou Destino</label>
                  <input placeholder="Ex: Filial Plano Piloto" value={newCliente} onChange={e => setNewCliente(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
               </div>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Cidade / UF</label>
                  <input placeholder="Brasília - DF" value={newCidade} onChange={e => setNewCidade(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSave} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><Check size={18} /> Salvar</button>
                  <button onClick={() => setIsAdding(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
               </div>
            </div>
         </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: 'rgba(0,0,0,0.4)', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Origem</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Ticket GLPI</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Nº do Pedido</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Cliente / Destino</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)' }}>Cidade / UF</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '500', color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets
               .filter(t => (t.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.ticket_glpi || '').includes(searchTerm) || (t.pedido || '').includes(searchTerm))
               .map((ticket, idx) => (
              <tr key={ticket.id} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ padding: '4px 8px', background: ticket.ticket_glpi === 'MANUAL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: ticket.ticket_glpi === 'MANUAL' ? '#10b981' : '#60a5fa', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {ticket.ticket_glpi === 'MANUAL' ? 'Digitado' : 'GLPI Sync'}
                    </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', color: ticket.ticket_glpi === 'MANUAL' ? 'var(--text-muted)' : 'white' }}>
                   {ticket.ticket_glpi !== 'MANUAL' ? `#${ticket.ticket_glpi}` : 'N/A'}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{ticket.pedido}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                   <div style={{ color: 'white' }}>{ticket.cliente}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Entrada: {new Date(ticket.data_entrada).toLocaleDateString('pt-BR')}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{ticket.cidade}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span style={{ padding: '4px 12px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
