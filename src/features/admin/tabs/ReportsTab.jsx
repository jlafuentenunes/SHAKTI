import React from 'react';
import { RefreshCcw } from 'lucide-react';

const ReportsTab = ({ analytics, fetchAnalytics }) => {
  return (
    <div className="admin-reports-view animate-in">
      <div className="admin-page-header">
        <h1>Analytics & Business Intelligence</h1>
        <p>Dados globais de crescimento e performance da Shakti Home.</p>
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '30px' }}>
        
        {/* Trend Chart (SVG) */}
        <div className="bento-card glass-effect chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
             <h3>Tendência de Agendamentos (7 dias)</h3>
             <RefreshCcw size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={fetchAnalytics} />
          </div>
          <div className="svg-chart-container" style={{ height: '200px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {analytics.trends.length > 1 && (
                <>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    d={`M ${analytics.trends.map((t, i) => `${(i * 100)},${180 - (t.count * 20)}`).join(' L ')} L ${(analytics.trends.length-1)*100},200 L 0,200 Z`}
                    fill="url(#areaGradient)"
                  />
                  <path 
                    d={`M ${analytics.trends.map((t, i) => `${(i * 100)},${180 - (t.count * 20)}`).join(' L ')}`}
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {analytics.trends.map((t, i) => (
                    <g key={i}>
                      <circle cx={i * 100} cy={180 - (t.count * 20)} r="4" fill="white" stroke="var(--primary)" strokeWidth="2" />
                      <text x={i * 100} y="195" fontSize="10" textAnchor="middle" fill="#999">{t.date.split('-').slice(1).join('/')}</text>
                      <text x={i * 100} y={170 - (t.count * 20)} fontSize="10" textAnchor="middle" fill="var(--primary)" fontWeight="700">{t.count}</text>
                    </g>
                  ))}
                </>
              )}
              {analytics.trends.length <= 1 && <text x="350" y="100" textAnchor="middle" fill="#999">Dados insuficientes para gerar gráfico histórico.</text>}
            </svg>
          </div>
        </div>

        {/* Service Pie-like Chart (Horizontal Bars) */}
        <div className="bento-card glass-effect chart-card">
          <h3>Tratamentos Mais Solicitados</h3>
          <div className="horizontal-bar-list mt-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {analytics.services.slice(0, 5).map((s, i) => {
              const max = analytics.services[0]?.count || 1;
              const perc = (s.count / max) * 100;
              return (
                <div key={i} className="bar-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span>{s.service_name}</span>
                    <strong>{s.count} packs</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${perc}%`, background: `linear-gradient(90deg, var(--primary), var(--primary-light))`, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bento-card glass-effect chart-card" style={{ gridColumn: 'span 2' }}>
          <h3>Performance por Especialista (Faturação)</h3>
          <div className="tech-perf-grid mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
             {analytics.technicians.map((t, idx) => (
               <div key={idx} className="tech-stat-box" style={{ padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                 <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{t.name}</h4>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '10px' }}>
                   <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem' }}>{parseFloat(t.revenue || 0).toFixed(0)}€</h2>
                   <small style={{ opacity: 0.6 }}>total</small>
                 </div>
                 <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', fontWeight: 600 }}>{t.count} serviços realizados</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
