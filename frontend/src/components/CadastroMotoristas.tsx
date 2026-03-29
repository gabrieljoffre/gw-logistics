import React, { useState, useEffect } from 'react';
import { UserPlus, Truck, Trash2, ShieldCheck, Check, X } from 'lucide-react';

// Exportados para uso nos outros componentes (GeradorRomaneio)
export let mockMotoristas: any[] = [];
export let mockVeiculos: any[] = [];

export default function CadastroMotoristas() {
  const [tab, setTab] = useState<'motoristas' | 'veiculos'>('motoristas');
  
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);

  const [addMot, setAddMot] = useState(false);
  const [newMotName, setNewMotName] = useState('');
  const [newMotCnh, setNewMotCnh] = useState('');

  const [addVei, setAddVei] = useState(false);
  const [newVeiPlaca, setNewVeiPlaca] = useState('');
  const [newVeiModelo, setNewVeiModelo] = useState('');
  const [newVeiCap, setNewVeiCap] = useState('');

  const loadMotoristas = async () => {
    try {
      const res = await fetch('/api/motoristas');
      const data = await res.json();
      setMotoristas(data);
      mockMotoristas = data; // Sync for other components
    } catch(e) { console.error(e); }
  };

  const loadVeiculos = async () => {
    try {
      const res = await fetch('/api/veiculos');
      const data = await res.json();
      setVeiculos(data);
      mockVeiculos = data; // Sync for other components
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadMotoristas(); loadVeiculos(); }, []);

  const handleSaveMotorista = async () => {
     if(!newMotName.trim()) return setAddMot(false);
     await fetch('/api/motoristas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: newMotName, cnh: newMotCnh || 'N/A' }) });
     setNewMotName(''); setNewMotCnh(''); setAddMot(false);
     await loadMotoristas();
  };

  const handleDeleteMotorista = async (id: number) => {
     if(!window.confirm('Remover motorista?')) return;
     await fetch(`/api/motoristas/${id}`, { method: 'DELETE' });
     await loadMotoristas();
  };

  const handleSaveVeiculo = async () => {
     if(!newVeiPlaca.trim()) return setAddVei(false);
     await fetch('/api/veiculos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placa: newVeiPlaca, modelo: newVeiModelo || 'N/A', capacidade: newVeiCap || 'N/A' }) });
     setNewVeiPlaca(''); setNewVeiModelo(''); setNewVeiCap(''); setAddVei(false);
     await loadVeiculos();
  };

  const handleDeleteVeiculo = async (id: number) => {
     if(!window.confirm('Remover veículo?')) return;
     await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
     await loadVeiculos();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
             <ShieldCheck size={24} color="#10b981" /> Cadastros e Frotas
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            Gerencie motoristas e veículos. Dados salvos na nuvem e disponíveis em qualquer dispositivo.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <button onClick={() => setTab('motoristas')} style={{ padding: '10px 20px', cursor: 'pointer', background: tab === 'motoristas' ? 'var(--accent)' : 'transparent', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
             <UserPlus size={18} /> Motoristas
          </button>
          <button onClick={() => setTab('veiculos')} style={{ padding: '10px 20px', cursor: 'pointer', background: tab === 'veiculos' ? 'var(--accent)' : 'transparent', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
             <Truck size={18} /> Veículos da Frota
          </button>
      </div>

      {/* --- ABA MOTORISTAS --- */}
      {tab === 'motoristas' && (
         <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
               <button className="button-primary" onClick={() => setAddMot(true)} style={{ background: '#10b981' }}><UserPlus size={18} /> Cadastrar Rápido</button>
            </div>
            
            {addMot && (
               <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#10b981' }}>Cadastrar Novo Motorista</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                     <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nome Completo</label>
                        <input autoFocus placeholder="Nome do Motorista" value={newMotName} onChange={e => setNewMotName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveMotorista()} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     </div>
                     <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>CNH (Opcional)</label>
                        <input placeholder="Ex: 12345678" value={newMotCnh} onChange={e => setNewMotCnh(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSaveMotorista} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><Check size={18} /> Salvar</button>
                        <button onClick={() => setAddMot(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                     </div>
                  </div>
               </div>
            )}
            
            <div style={{borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: 'rgba(0,0,0,0.4)' }}>
                <tr>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Nome Completo</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>CNH</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {motoristas.length === 0 && <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum motorista cadastrado ainda.</td></tr>}
                {motoristas.map((m, idx) => (
                  <tr key={m.id} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'white', fontWeight: '600' }}>{m.nome}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{m.cnh}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>Ativo</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                       <button onClick={() => handleDeleteMotorista(m.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
         </div>
      )}

      {/* --- ABA VEÍCULOS --- */}
      {tab === 'veiculos' && (
         <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
               <button className="button-primary" onClick={() => setAddVei(true)} style={{ background: '#10b981' }}><Truck size={18} /> Cadastrar Rápido</button>
            </div>
            
            {addVei && (
               <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#10b981' }}>Cadastrar Novo Veículo</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                     <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Veículo / Modelo</label>
                        <input autoFocus placeholder="Ex: HR Hyundai" value={newVeiModelo} onChange={e => setNewVeiModelo(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     </div>
                     <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Placa</label>
                        <input placeholder="XXX-0000" value={newVeiPlaca} onChange={e => setNewVeiPlaca(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     </div>
                     <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Capacidade</label>
                        <input placeholder="Ex: 1500kg" value={newVeiCap} onChange={e => setNewVeiCap(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '8px' }}/>
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSaveVeiculo} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}><Check size={18} /> Salvar</button>
                        <button onClick={() => setAddVei(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                     </div>
                  </div>
               </div>
            )}
            
            <div style={{borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: 'rgba(0,0,0,0.4)' }}>
                <tr>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Veículo / Modelo</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Placa</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Capacidade</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum veículo cadastrado ainda.</td></tr>}
                {veiculos.map((v, idx) => (
                  <tr key={v.id} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', color: 'white', fontWeight: '600' }}>{v.modelo}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{v.placa}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>{v.capacidade}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>Operacional</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                       <button onClick={() => handleDeleteVeiculo(v.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
         </div>
      )}

    </div>
  );
}
