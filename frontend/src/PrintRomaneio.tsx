import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Ticket {
  ticket: string;
  pedido: string;
  cidade: string;
  cliente: string;
}

interface PrintData {
  id: string;
  data: string;
  motorista: string;
  veiculo: string;
  aproveitamento: string;
  observacoes: string;
  link_maps: string;
  tickets: Ticket[];
}

export default function PrintRomaneio({ data }: { data: PrintData | null }) {
  if (!data) return null; // Don't render until triggered by printing.

  const ticketLabel = (t: string) => t.startsWith('MANUAL') ? 'MANUAL' : t;

  return (
    <div className="print-only" style={{ padding: '1.5cm', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '16px' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '900', fontSize: '36px', letterSpacing: '-2px', fontStyle: 'italic' }}>GW<span style={{ fontWeight: 'normal', fontSize: '24px' }}>(📡)</span></div>
           </div>
           <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '-4px' }}>GW Wireless</div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>ROMANEIO DE ENTREGA - Nº {data.id}</h1>
           <p style={{ margin: 0, fontSize: '14px' }}>Data de Emissão: {data.data} e Horário: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* DADOS DA VIAGEM */}
      <div style={{ marginBottom: '24px' }}>
         <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Dados da Viagem</h2>
         <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
            <strong>Motorista:</strong> {data.motorista} &nbsp;&nbsp;|&nbsp;&nbsp; 
            <strong>Veículo:</strong> {data.veiculo} &nbsp;&nbsp;|&nbsp;&nbsp; 
            <strong>Aproveitamento:</strong> {data.aproveitamento}
         </p>
         <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>Observações:</strong> {data.observacoes || 'Nenhuma observação informada.'}
         </p>
      </div>

      {/* TABELA DE CARGA */}
      <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Tabela de Carga</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', border: '1px solid black', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '6px', width: '50px', background: '#f5f5f5' }}>Seq.</th>
            <th style={{ border: '1px solid black', padding: '6px', background: '#f5f5f5' }}>Ticket</th>
            <th style={{ border: '1px solid black', padding: '6px', background: '#f5f5f5' }}>Pedido</th>
            <th style={{ border: '1px solid black', padding: '6px', background: '#f5f5f5' }}>Cliente</th>
            <th style={{ border: '1px solid black', padding: '6px', background: '#f5f5f5' }}>Cidade</th>
            <th style={{ border: '1px solid black', padding: '6px', width: '200px', background: '#f5f5f5' }}>Assinatura/Canhoto</th>
          </tr>
        </thead>
        <tbody>
          {data.tickets.map((t, idx) => (
             <tr key={idx} style={{ background: idx % 2 === 1 ? '#f5f5f5' : 'transparent' }}>
                <td style={{ border: '1px solid black', padding: '8px 6px', textAlign: 'center' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                <td style={{ border: '1px solid black', padding: '8px 6px', textAlign: 'center' }}>{ticketLabel(t.ticket)}</td>
                <td style={{ border: '1px solid black', padding: '8px 6px', textAlign: 'center' }}>{t.pedido}</td>
                <td style={{ border: '1px solid black', padding: '8px 6px' }}>{t.cliente}</td>
                <td style={{ border: '1px solid black', padding: '8px 6px' }}>{t.cidade}</td>
                <td style={{ border: '1px solid black', padding: '16px 6px', verticalAlign: 'bottom' }}>
                   <div style={{ borderBottom: '1px solid black', width: '100%' }}></div>
                </td>
             </tr>
          ))}
        </tbody>
      </table>

      {/* RODAPÉ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div style={{ display: 'flex', gap: '16px' }}>
            <QRCodeSVG value={data.link_maps || "https://maps.google.com"} size={80} />
            <div>
               <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>QR Code da Rota:</p>
               <p style={{ margin: 0, fontSize: '13px', width: '250px' }}>Link dinâmico para o Google Maps com a sequência das entregas.</p>
            </div>
         </div>
         
         <div style={{ flex: 1, marginLeft: '40px' }}>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', fontWeight: 'bold' }}>Total de Pedidos: {data.tickets.length}</p>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold' }}>Campos para assinaturas:</p>
            <div style={{ display: 'flex', gap: '40px' }}>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1 }}>
                  <span>Conferente:</span>
                  <div style={{ borderBottom: '1px solid black', flex: 1 }}></div>
               </div>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1 }}>
                  <span>Motorista:</span>
                  <div style={{ borderBottom: '1px solid black', flex: 1 }}></div>
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
