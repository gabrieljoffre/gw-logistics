import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação temporária de autenticação - será ligada ao Backend na Nuvem depois
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
      
      {/* Efeitos visuais de fundo */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '30vw', height: '30vw', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />

      <div className="glass-panel" style={{ 
          padding: '48px', 
          width: '100%', 
          maxWidth: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          zIndex: 10
        }}>
        
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
             <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', padding: '16px', borderRadius: '16px', display: 'inline-flex' }}>
                <Lock size={32} color="white" />
             </div>
           </div>
           <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.5px' }}>GW Logistics</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Acesso restrito ao painel operacional</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
             <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Usuário</label>
             <div style={{ position: 'relative' }}>
                <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="admin"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(false); }}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', color: 'white', border: error ? '1px solid #ef4444' : '1px solid var(--border-color)', outline: 'none', borderRadius: '8px', transition: 'border 0.2s' }}
                />
             </div>
          </div>

          <div>
             <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Senha</label>
             <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', color: 'white', border: error ? '1px solid #ef4444' : '1px solid var(--border-color)', outline: 'none', borderRadius: '8px', transition: 'border 0.2s' }}
                />
             </div>
          </div>

          {error && (
             <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
                Credenciais inválidas. Tente novamente.
             </div>
          )}

          <button type="submit" style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '14px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '15px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}>
             Entrar no Sistema <LogIn size={18} />
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
           <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>GW Wireless © 2026 - Protegido por criptografia</p>
        </div>
      </div>
    </div>
  );
}
