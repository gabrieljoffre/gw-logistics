import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Check, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ErrosLogisticos() {
  const [erros, setErros] = useState<any[]>([]);
  
  const loadErros = async () => {
    try {
      const res = await fetch('/api/erros');
      const data = await res.json();
      setErros(data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadErros(); }, []);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTipo, setNewTipo] = useState('Despesa');
  const [newRomaneio, setNewRomaneio] = useState('');
  const [newTicket, setNewTicket] = useState('');
  const [newResp, setNewResp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newValor, setNewValor] = useState('');

  const formatCurrency = (val: number) => {
     try {
       return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
     } catch (e) {
       return 'R$ 0,00';
     }
  }

  const handleSave = async () => {
    if(!newDesc) return setIsAdding(false);
    
    // Robust parsing para valores do mundo real
    let strVal = newValor.replace(/[^\d,-]/g, '').replace(',', '.');
    const numericValor = parseFloat(strVal) || 0;

    const novo = {
      romaneio: newRomaneio || 'N/A',
      ticket: newTicket || 'N/A',
      responsavel: newResp || 'N/A',
      descricao: newDesc,
      status: newTipo === 'Receita' ? 'Solucionado' : 'Pendente',
      valor: numericValor,
      tipo: newTipo
    };

    try {
       await fetch('/api/erros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novo)
       });
       await loadErros();
    } catch(e) { console.error(e); }

    setNewRomaneio(''); setNewTicket(''); setNewResp(''); setNewDesc(''); setNewValor(''); setNewTipo('Despesa');
    setIsAdding(false);
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Pendente' ? 'Solucionado' : 'Pendente';
    await fetch(`/api/erros/${id}/status`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: newStatus })
    });
    loadErros();
  }

  const totalPrejuizo = erros.filter(e => e.tipo === 'Despesa').reduce((acc, curr) => acc + curr.valor, 0);
  const totalReceita = erros.filter(e => e.tipo === 'Receita').reduce((acc, curr) => acc + curr.valor, 0);
  const balanco = totalReceita - totalPrejuizo;

  return (
    <div className="glass-panel" style={{ padding: '24px', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
             <AlertTriangle size={24} color="#ef4444" /> Financeiro / Erros Logísticos
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Controle de prejuízos operacionais e saldos extras (venda de materiais, ajudas).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '10px', left: '12px' }} />
              <input 
                 type="text" 
                 placeholder="Buscar por Ticket ou Romaneio..." 
                 style={{ padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', width: '280px', outline: 'none' }}
              />
           </div>
           <button onClick={() => setIsAdding(true)} className="button-primary" style={{ background: '#3b82f6' }}>
             <Plus size={18} /> Novo Lançamento
           </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
         <div style={{ flex: 1, padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingDown size={16} color="#ef4444"/> Prejuízos (Erros/Multas)</p>
           <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(totalPrejuizo)}</h3>
         </div>
         <div style={{ flex: 1, padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} color="#10b981"/> Saldo Extra (Papelão, etc)</p>
           <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(totalReceita)}</h3>
         </div>
         <div style={{ flex: 1, padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} color="#3b82f6"/> Balanço Líquido</p>
           <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: balanco >= 0 ? '#10b981' : '#ef4444' }}>
              {balanco > 0 ? '+' : ''}{formatCurrency(balanco)}
           </h3>
         </div>
      </div>

      {isAdding && (
         <div style={{ background: newTipo === 'Despesa' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: newTipo === 'Despesa' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {newTipo === 'Despesa' ? 'Registrar Nova Despesa/Falha' : 'Registrar Nova Receita Extra'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Tipo Lançamento</label>
                  <select value={newTipo} onChange={e => setNewTipo(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}>
                      <option value="Despesa">👎 Falha / Custo</option>
                      <option value="Receita">👍 Receita / Saldo</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Romaneio / Ticket</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <input placeholder="ROM-..." value={newRomaneio} onChange={e => setNewRomaneio(e.target.value)} style={{ width: '50%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     <input placeholder="Ticket" value={newTicket} onChange={e => setNewTicket(e.target.value)} style={{ width: '50%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                  </div>
               </div>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Descrição</label>
                  <input autoFocus placeholder={newTipo === 'Despesa' ? "Motivo do prejuízo..." : "Origem do dinheiro (Ex: Papelão)"} value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
               </div>
               <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Valor</label>
                  <input placeholder="R$ 0,00" value={newValor} onChange={e => setNewValor(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSave} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Check size={18} /> Salvar</button>
                  <button onClick={() => setIsAdding(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><X size={18} /></button>
               </div>
            </div>
         </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: 'rgba(0,0,0,0.4)', position: 'sticky', top: 0 }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Tipo</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Romaneio / Ticket</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Descrição</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Valor</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {erros.map((erro, idx) => {
              const isReceita = erro.tipo === 'Receita';
              return (
              <tr key={erro.id} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = isReceita ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ padding: '4px 8px', background: isReceita ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isReceita ? '#10b981' : '#ef4444', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {erro.tipo}
                    </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                   <div style={{ fontWeight: '600', color: 'white' }}>{erro.romaneio}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ticket: {erro.ticket}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{erro.descricao}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: isReceita ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{isReceita ? '+' : '-'}{formatCurrency(erro.valor)}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                  {isReceita ? (
                    <span style={{ padding: '4px 12px', color: '#10b981', background: 'transparent', fontSize: '12px', fontWeight: 'bold' }}>Salvo</span>
                  ) : (
                    <button onClick={() => toggleStatus(erro.id, erro.status)} style={{ padding: '4px 12px', background: erro.status === 'Pendente' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: erro.status === 'Pendente' ? '#f59e0b' : '#10b981', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }} title="Clique para alternar status">
                      {erro.status}
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
