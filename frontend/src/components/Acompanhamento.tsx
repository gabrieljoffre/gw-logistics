import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, AlertOctagon, ArrowRight, XCircle, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

// ─── MODAL DE EDIÇÃO ────────────────────────────────────────────────────────
function EditModal({ romaneio, onClose, onSave }: any) {
  const [motorista, setMotorista] = useState(romaneio.motorista || '');
  const [veiculo, setVeiculo] = useState(romaneio.veiculo || '');
  const [linkMaps, setLinkMaps] = useState(romaneio.link_maps || '');
  const [tickets, setTickets] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [filaDisp, setFilaDisp] = useState<any[]>([]);

  // Novo pedido manual
  const [novoTicket, setNovoTicket] = useState('');
  const [novoPedido, setNovoPedido] = useState('');
  const [novoCliente, setNovoCliente] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [addingManual, setAddingManual] = useState(false);

  useEffect(() => {
    // Carrega itens do romaneio
    fetch(`/api/romaneios/${romaneio.id_romaneio}/items`)
      .then(r => r.json()).then(setTickets).catch(() => {});
    fetch('/api/motoristas').then(r => r.json()).then(setMotoristas).catch(() => {});
    fetch('/api/veiculos').then(r => r.json()).then(setVeiculos).catch(() => {});
    fetch('/api/fila').then(r => r.json())
      .then(d => setFilaDisp(d.filter((t: any) => t.status === 'Pendente'))).catch(() => {});
  }, []);

  const removeTicket = async (ticket_glpi: string) => {
    await fetch(`/api/romaneios/${romaneio.id_romaneio}/items/${encodeURIComponent(ticket_glpi)}`, { method: 'DELETE' });
    setTickets(tickets.filter(t => t.ticket_glpi !== ticket_glpi));
    // Devolver para fila
    await fetch(`/api/fila/status/${encodeURIComponent(ticket_glpi)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Pendente' })
    });
  };

  const addFromFila = async (item: any) => {
    await fetch(`/api/romaneios/${romaneio.id_romaneio}/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_glpi: item.ticket_glpi, pedido: item.pedido, cliente: item.cliente, cidade: item.cidade })
    });
    await fetch(`/api/fila/status/${encodeURIComponent(item.ticket_glpi)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Roteirizado' })
    });
    setFilaDisp(filaDisp.filter(f => f.id !== item.id));
    setTickets([...tickets, { ticket_glpi: item.ticket_glpi, pedido: item.pedido, cliente: item.cliente, cidade: item.cidade }]);
  };

  const addManual = async () => {
    if (!novoPedido) return;
    const t = { ticket_glpi: novoTicket || `MANUAL-${Date.now()}`, pedido: novoPedido, cliente: novoCliente || 'N/A', cidade: novaCidade || 'N/A' };
    await fetch(`/api/romaneios/${romaneio.id_romaneio}/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t)
    });
    setTickets([...tickets, t]);
    setNovoTicket(''); setNovoPedido(''); setNovoCliente(''); setNovaCidade(''); setAddingManual(false);
  };

  const handleSave = async () => {
    await fetch(`/api/romaneios/${romaneio.id_romaneio}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motorista, veiculo, link_maps: linkMaps })
    });
    onSave();
    onClose();
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ background: '#0f1629', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>✏️ Editar Romaneio: {romaneio.id_romaneio}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Motorista / Veículo / Maps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Motorista</label>
            <select value={motorista} onChange={e => setMotorista(e.target.value)} style={{ ...inputStyle, background: '#1e293b' }}>
              {motoristas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
              <option value={motorista}>{motorista}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Veículo</label>
            <select value={veiculo} onChange={e => setVeiculo(e.target.value)} style={{ ...inputStyle, background: '#1e293b' }}>
              {veiculos.map(v => <option key={v.id} value={`${v.modelo} (${v.placa})`}>{v.modelo} ({v.placa})</option>)}
              <option value={veiculo}>{veiculo}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#10b981', display: 'block', marginBottom: '6px' }}>🔗 Link Google Maps</label>
            <input value={linkMaps} onChange={e => setLinkMaps(e.target.value)} placeholder="https://maps.app.goo.gl/..." style={{ ...inputStyle, border: '1px solid #10b981' }} />
          </div>
        </div>

        {/* Pedidos do Romaneio */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Pedidos na Carga ({tickets.length})</h3>
            <button onClick={() => setAddingManual(!addingManual)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Adicionar Manual
            </button>
          </div>

          {addingManual && (
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ticket (opcional)</label><input placeholder="4502" value={novoTicket} onChange={e => setNovoTicket(e.target.value)} style={inputStyle} /></div>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pedido/NF*</label><input autoFocus placeholder="10050" value={novoPedido} onChange={e => setNovoPedido(e.target.value)} style={inputStyle} /></div>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cliente</label><input placeholder="Nome do cliente" value={novoCliente} onChange={e => setNovoCliente(e.target.value)} style={inputStyle} /></div>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cidade</label><input placeholder="Brasília - DF" value={novaCidade} onChange={e => setNovaCidade(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={addManual} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><Save size={16} /></button>
                  <button onClick={() => setAddingManual(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              </div>
            </div>
          )}

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Ticket</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Pedido</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Cliente</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Cidade</th>
                <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}></th>
              </tr></thead>
              <tbody>
                {tickets.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum pedido</td></tr>}
                {tickets.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{t.ticket_glpi || t.ticket}</td>
                    <td style={{ padding: '12px' }}>{t.pedido}</td>
                    <td style={{ padding: '12px' }}>{t.cliente}</td>
                    <td style={{ padding: '12px' }}>{t.cidade}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => removeTicket(t.ticket_glpi || t.ticket)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adicionar da Fila */}
        {filaDisp.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>+ Adicionar da Fila de Espera</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filaDisp.map(f => (
                <button key={f.id} onClick={() => addFromFila(f)} style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  + {f.pedido} / {f.cliente}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} style={{ padding: '12px 24px', background: 'var(--accent)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── COLUNA KANBAN ───────────────────────────────────────────────────────────
const Column = ({ title, icon, color, items, onAdvance, onProblem, onEdit }: any) => (
  <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: `2px solid ${color}` }}>
      {icon}
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{title}</h3>
      <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{items.length}</span>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '500px' }}>
      {items.map((rota: any) => (
        <div key={rota.id_romaneio} className="glass-panel" style={{ padding: '16px', borderTop: `4px solid ${color}`, transition: 'transform 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
             <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{rota.id_romaneio}</span>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
               {rota.data_criacao ? new Date(rota.data_criacao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''}
             </span>
          </div>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Motorista:</strong> {rota.motorista || '—'}</p>
          <p style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-muted)' }}>Carro: {rota.veiculo || '—'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{rota.pedidos || 0} Pedidos</span>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {rota.status === 'Criado' && (
                <button onClick={() => onEdit(rota)} title="Editar Romaneio" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>
                  <Edit2 size={14} />
                </button>
              )}
              {rota.status !== 'Finalizada' && rota.status !== 'Entrega Parcial' && (
                <button onClick={() => onProblem(rota.id_romaneio)} title="Reportar Problema" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}>
                  <XCircle size={14} />
                </button>
              )}
              {rota.status !== 'Finalizada' && (
                <button onClick={() => onAdvance(rota.id_romaneio, rota.status)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                   Avançar <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
         <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px', marginTop: '12px' }}>Vazio</div>
      )}
    </div>
  </div>
);

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function Acompanhamento() {
  const [rotas, setRotas] = useState<any[]>([]);
  const [editTarget, setEditTarget] = useState<any>(null);

  const loadRotas = async () => {
    try {
       const res = await fetch('/api/romaneios');
       const data = await res.json();
       setRotas(data);
    } catch(e) { console.error(e) }
  };

  useEffect(() => { loadRotas(); }, []);

  const changeStatus = async (id: string, newStatus: string) => {
     await fetch(`/api/romaneios/${id}/status`, {
       method: 'PUT', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: newStatus })
     });
     loadRotas();
  };

  const handleAdvance = (id: string, currStatus: string) => {
     if (currStatus === 'Criado') changeStatus(id, 'Em Rota');
     else if (currStatus === 'Em Rota') changeStatus(id, 'Finalizada');
     else if (currStatus === 'Entrega Parcial') changeStatus(id, 'Em Rota');
  };

  const handleProblem = (id: string) => {
     if(window.confirm('Marcar como Entrega Parcial/Pendência?')) changeStatus(id, 'Entrega Parcial');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {editTarget && <EditModal romaneio={editTarget} onClose={() => setEditTarget(null)} onSave={loadRotas} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <MapPin size={24} color="var(--accent)" /> Acompanhamento Operacional (Kanban)
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Clique em ✏️ para editar romaneios em pátio. Use "Avançar" para mudar status.
          </p>
        </div>
        <button onClick={loadRotas} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          🔄 Atualizar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
         <Column title="Criados (Pátio)" icon={<Truck size={18} color="#94a3b8" />} color="#94a3b8" items={rotas.filter(r => r.status === 'Criado')} onAdvance={handleAdvance} onProblem={handleProblem} onEdit={setEditTarget} />
         <Column title="Em Rota (Na Rua)" icon={<Truck size={18} color="#3b82f6" />} color="#3b82f6" items={rotas.filter(r => r.status === 'Em Rota')} onAdvance={handleAdvance} onProblem={handleProblem} onEdit={setEditTarget} />
         <Column title="Parcial/Pendência" icon={<AlertOctagon size={18} color="#f59e0b" />} color="#f59e0b" items={rotas.filter(r => r.status === 'Entrega Parcial')} onAdvance={handleAdvance} onProblem={handleProblem} onEdit={setEditTarget} />
         <Column title="Finalizadas" icon={<CheckCircle size={18} color="#10b981" />} color="#10b981" items={rotas.filter(r => r.status === 'Finalizada')} onAdvance={handleAdvance} onProblem={handleProblem} onEdit={setEditTarget} />
      </div>
    </div>
  );
}
