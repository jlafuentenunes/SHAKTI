import React from 'react';
import { Mail, CheckCircle2, X, TrendingUp, CheckSquare, Calendar, Users, DollarSign } from 'lucide-react';
import StatCard from '../../../components/StatCard';

const AppointmentsTab = ({ 
  appointments, technicians, services, analytics, 
  updateBookingStatus, handlePromote, notify 
}) => {
  return (
    <>
      <div className="admin-stats-grid">
        <StatCard 
          title="Faturação Bruta" value={`${analytics.revenue}€`} 
          icon={<DollarSign size={20} />} iconBg="rgba(45, 90, 39, 0.1)" iconColor="var(--primary)" 
        />
        <StatCard 
          title="Clientes Ativos" value={analytics.customers?.active_customers || 0} 
          icon={<Users size={20} />} iconBg="rgba(228, 197, 158, 0.2)" iconColor="#b68e5e" 
        />
        <StatCard 
          title="Agendamentos" value={appointments.filter(a => a.status !== 'cancelled').length} 
          icon={<Calendar size={20} />} iconBg="rgba(52, 152, 219, 0.1)" iconColor="#3498db" 
        />
        <StatCard 
          title="LTV Médio" value={`${(analytics.revenue / (analytics.customers?.total_customers || 1)).toFixed(2)}€`} 
          icon={<TrendingUp size={20} />} iconBg="rgba(155, 89, 182, 0.1)" iconColor="#9b59b6" 
        />
      </div>

      {/* Standard Table (Desktop) */}
      <div className="admin-table-container glass-effect animate-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Cliente</th>
              <th>Serviço/Técnico</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>
                  <div className="date-cell">
                    <strong>{a.booking_date}</strong>
                    <span>{a.booking_time}</span>
                  </div>
                </td>
                <td>
                  <div className="customer-cell">
                    <strong>{a.customer_name}</strong>
                    <div className="contact-small">
                      <small><Mail size={12}/> {a.customer_email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="service-cell">
                    <strong>{a.service_name}</strong>
                    <span className="tech-badge">{technicians.find(t => t.id == a.technician_id)?.name || 'Sem técnico'}</span>
                  </div>
                </td>
                <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                <td>
                  <div className="admin-actions-cell">
                    {a.status === 'pending' && <button className="action-btn confirm" title="Confirmar" onClick={() => updateBookingStatus(a.id, 'confirmed')}><CheckCircle2 size={18} /></button>}
                    {a.status !== 'cancelled' && <button className="action-btn cancel" title="Cancelar" onClick={() => confirm('Deseja cancelar?') && updateBookingStatus(a.id, 'cancelled')}><X size={18} /></button>}
                    {a.status === 'cancelled' && <button className="action-btn" title="Promover Vaga" style={{ background: 'var(--primary)', color: 'white' }} onClick={() => handlePromote(a.id)}><TrendingUp size={18} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (Phones) */}
      <div className="admin-mobile-cards animate-in">
        {appointments.map(a => (
          <div key={a.id} className="mobile-booking-card glass-effect">
            <div className="mobile-card-row">
              <span className="mobile-card-label">Cliente</span>
              <span className="mobile-card-value">{a.customer_name}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Data / Hora</span>
              <span className="mobile-card-value">{a.booking_date} às {a.booking_time}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Serviço</span>
              <span className="mobile-card-value">{a.service_name}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Técnico</span>
              <span className="mobile-card-value">{technicians.find(t => t.id == a.technician_id)?.name || 'N/A'}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Status</span>
              <span className={`status-badge ${a.status}`}>{a.status}</span>
            </div>
            {/* Checklist Preview if exists */}
            {services.find(s => s.name === a.service_name)?.checklist ? (
              <div className="mobile-card-checklist mt-2" style={{ background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', color: 'var(--text-muted)' }}>Checklist do Serviço</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(() => {
                    try {
                      const list = services.find(s => s.name === a.service_name).checklist;
                      const parsed = typeof list === 'string' ? JSON.parse(list) : list;
                      return parsed.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <CheckSquare size={12} color="var(--primary)" /> {item}
                        </div>
                      ));
                    } catch(e) { return null; }
                  })()}
                </div>
              </div>
            ) : null}
            <div className="mobile-card-actions">
              {a.status === 'pending' && (
                 <button className="btn-primary w-full" onClick={() => updateBookingStatus(a.id, 'confirmed')}>Confirmar</button>
              )}
              {a.status !== 'cancelled' && (
                 <button className="btn-secondary w-full" onClick={() => confirm('Cancelar?') && updateBookingStatus(a.id, 'cancelled')}>Cancelar</button>
              )}
              {a.status === 'cancelled' && (
                 <button className="btn-secondary w-full" style={{ background: '#2d5a27', color: 'white' }} onClick={() => handlePromote(a.id)}>
                   <TrendingUp size={16} /> Promover Vaga (Flash Deal)
                 </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AppointmentsTab;
