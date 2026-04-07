import React from 'react';

const SettingsTab = ({ settings, updateSettings }) => {
  return (
    <div className="settings-layout animate-in">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
        <h2 style={{ marginBottom: '30px' }}>Configurações de Horário</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const f = e.target;
          updateSettings({ calendar_start: f.s.value, calendar_end: f.e.value, slot_duration: f.d.value });
        }}>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Hora Abertura</label>
              <input name="s" type="time" defaultValue={settings.calendar_start} className="glass-input" />
            </div>
            <div className="form-group">
              <label>Hora Encerramento</label>
              <input name="e" type="time" defaultValue={settings.calendar_end} className="glass-input" />
            </div>
            <div className="form-group">
              <label>Duração Bloco (min)</label>
              <select name="d" defaultValue={settings.slot_duration} className="glass-input">
                <option value="30">30</option><option value="60">60</option><option value="90">90</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-8">Guardar Todas as Configurações</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsTab;
