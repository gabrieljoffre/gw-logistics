import React, { useState, Component } from 'react';
import PrintRomaneio from './PrintRomaneio';
import FilaEspera from './components/FilaEspera';
import GeradorRomaneio from './components/GeradorRomaneio';
import Acompanhamento from './components/Acompanhamento';
import ErrosLogisticos from './components/ErrosLogisticos';
import CadastroMotoristas from './components/CadastroMotoristas';
import Login from './components/Login';
import { Truck, LayoutDashboard, Clock, AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';

// Error Boundary — protege cada aba individualmente
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: any) { return { error: e?.message || 'Erro desconhecido' }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '40px', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', margin: '16px' }}>
        <h3 style={{ marginBottom: '8px' }}>⚠️ Algo deu errado nesta aba</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{this.state.error}</p>
        <button onClick={() => this.setState({ error: null })} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Tentar Novamente</button>
      </div>
    );
    return this.props.children;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('fila');
  const [printData, setPrintData] = useState<any>(null);

  const handlePrint = (data: any) => {
    setPrintData(data);
    setTimeout(() => { window.print(); }, 200);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const navBtn = (tab: string, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === tab ? 'var(--accent)' : 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s', width: '100%' }}>
      {icon} {label}
    </button>
  );

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <div className="sidebar no-print glass-panel" style={{ margin: '16px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', marginTop: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', lineHeight: '1', color: 'var(--text-main)' }}>
            <span>GW</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--accent)' }}>SISTEMA DE ENTREGAS</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navBtn('fila', <Clock size={20} />, 'Fila de Espera')}
          {navBtn('gerador', <LayoutDashboard size={20} />, 'Montar Romaneio')}
          {navBtn('acompanhamento', <Truck size={20} />, 'Acompanhamento')}
          {navBtn('erros', <AlertTriangle size={20} />, 'Erros Logísticos')}
          {navBtn('cadastros', <ShieldCheck size={20} />, 'Frota / Cadastros')}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
           <button onClick={() => setIsAuthenticated(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
             <LogOut size={20} /> Sair do Sistema
           </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content no-print">
        <ErrorBoundary key={activeTab}>
          {activeTab === 'fila' && <FilaEspera />}
          {activeTab === 'gerador' && <GeradorRomaneio onPrint={handlePrint} />}
          {activeTab === 'acompanhamento' && <Acompanhamento />}
          {activeTab === 'erros' && <ErrosLogisticos />}
          {activeTab === 'cadastros' && <CadastroMotoristas />}
        </ErrorBoundary>
      </div>

      {/* PRINT ONLY */}
      <PrintRomaneio data={printData} />
    </div>
  );
}

export default App;
