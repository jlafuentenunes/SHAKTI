import React from 'react';

const TechniciansTab = ({ 
  technicians, appointments, services, 
  updateHourlyRate, fetchTechnicians 
}) => {
  return (
    <div className="technicians-layout-v3 animate-in">
      <div className="bento-grid-tech">
        <div className="glass-card p-6">
          <h3>Adicionar Talento</h3>
          <form className="modern-form mt-4" onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            const res = await fetch('/api/technicians', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('shakti-token') },
              body: JSON.stringify({ name: f.nm.value, username: f.un.value, password: f.pw.value, specialty: f.sp.value })
            });
            if ((await res.json()).success) { alert('Criado!'); f.reset(); fetchTechnicians(); }
          }}>
            <input name="nm" placeholder="Nome Completo" className="glass-input" required />
            <input name="un" placeholder="Login" className="glass-input mt-2" required />
            <input name="pw" type="password" placeholder="Password" className="glass-input mt-2" required />
            <select name="sp" className="glass-input mt-2">
              <option>Massagens</option><option>Cabeleireiro</option><option>Unhas</option><option>Terapias</option>
            </select>
            <button className="btn-primary w-full mt-4">Registar Técnico</button>
          </form>
        </div>
        <div className="tech-list-box-mod">
          {technicians.map(t => (
            <div key={t.id} className="tech-card-premium glass-effect">
              <div className="avatar-small">{t.name[0]}</div>
              <div className="tech-info-v3">
                <h4>{t.name}</h4>
                <p>{t.specialty}</p>
                <div className="hr-rate-edit">
                  <label>€/h:</label>
                  <input type="number" defaultValue={t.hourly_rate} onBlur={e => updateHourlyRate(t.id, e.target.value)} />
                </div>
              </div>
              <div className="tech-stat-v3">
                <small>Estimativa Pago</small>
                <strong>{appointments.filter(a => a.technician_id == t.id && a.status === 'confirmed').reduce((acc, curr) => {
                  const s = services.find(serv => serv.name === curr.service_name);
                  const h = s ? (parseFloat(s.duration) / 60) : 1;
                  return acc + (h * (t.hourly_rate || 0));
                }, 0).toFixed(2)}€</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechniciansTab;
