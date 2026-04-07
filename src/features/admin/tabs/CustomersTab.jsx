import React, { useState } from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';

const CustomersTab = ({ 
  customers, customerSearch, setCustomerSearch, 
  appointments, updateCustomer 
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="customers-layout animate-in">
      <div className="admin-page-header">
        <h1>Gestão de Clientes (CRM)</h1>
        <div className="header-actions">
          <div className="search-box-v3">
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou email..." 
              className="glass-input"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bento-grid">
        {customers.map(c => (
          <div key={c.id} className="bento-card glass-effect customer-card" style={{ cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => setSelectedCustomer(c)}>
            <div className="customer-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="avatar-med" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{c.name[0]}</div>
              <div>
                 <h3 style={{ margin: 0, fontSize: '1rem' }}>{c.name}</h3>
                 <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>{c.email}</p>
              </div>
            </div>
            <div className="customer-mini-stats mt-4" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8 }}>
               <div><strong>{c.total_bookings}</strong> visitas</div>
               <div><strong>{c.total_spent || 0}€</strong> total</div>
               <div>Última: {c.last_visit ? new Date(c.last_visit).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content profile-modal animate" style={{ maxWidth: '900px', padding: '0', background: 'white', borderRadius: '30px', overflow: 'hidden' }}>
            <div className="profile-header" style={{ background: 'var(--primary)', color: 'white', padding: '40px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <div className="avatar-large" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900 }}>{selectedCustomer.name[0]}</div>
                <div className="profile-main-info">
                   <h2 style={{ margin: 0, fontSize: '2rem' }}>{selectedCustomer.name}</h2>
                   <p style={{ margin: '5px 0', opacity: 0.8 }}>{selectedCustomer.email} • {selectedCustomer.phone}</p>
                   <div className="chips-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                     <span className="chip" style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>Cliente desde {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                     <span className="chip highlight" style={{ background: 'white', color: 'var(--primary)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFICADO</span>
                   </div>
                </div>
              </div>
              <X className="close-profile" style={{ position: 'absolute', top: '25px', right: '25px', cursor: 'pointer', opacity: 0.7 }} onClick={() => setSelectedCustomer(null)} />
            </div>

            <div className="profile-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
              <div className="profile-sidebar" style={{ padding: '30px', borderRight: '1px solid #eee' }}>
                <div className="sidebar-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Data de Aniversário</label>
                  <input 
                    type="date" 
                    className="glass-input" 
                    defaultValue={selectedCustomer.birthday ? selectedCustomer.birthday.slice(0, 10) : ''}
                    onBlur={(e) => updateCustomer(selectedCustomer.id, { birthday: e.target.value })}
                  />
                  <p style={{ fontSize: '0.65rem', margin: '5px 0', opacity: 0.6 }}>Ideal para campanhas de bday.</p>
                </div>
                
                <div className="sidebar-group mt-10">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Histórico de Tratamentos</h3>
                  <div className="mini-timeline" style={{ borderLeft: '2px solid #eee', paddingLeft: '20px', marginLeft: '5px' }}>
                    {appointments.filter(a => a.customer_email === selectedCustomer.email).slice(0, 5).map(a => (
                      <div key={a.id} className="timeline-item" style={{ position: 'relative', paddingBottom: '20px' }}>
                        <div className="dot" style={{ position: 'absolute', left: '-27px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: a.status === 'confirmed' ? 'var(--primary)' : '#ccc' }}></div>
                        <div className="tl-content">
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>{a.service_name}</strong>
                          <p style={{ fontSize: '0.7rem', margin: '2px 0', opacity: 0.6 }}>{new Date(a.booking_date).toLocaleDateString()} • {a.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
