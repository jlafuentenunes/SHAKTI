import React from 'react';
import { Package, X, CheckSquare } from 'lucide-react';

const ServicesTab = ({ 
  services, technicians, serviceSearch, setServiceSearch, 
  showDeletedServices, setShowDeletedServices, createService, 
  softDeleteService, restoreService, hardDeleteService, 
  vouchers, deleteVoucher, createManualVoucher, notify, fetchServicesFromDB 
}) => {
  return (
    <div className="services-layout-v3 animate-in">
      <div className="admin-page-header">
        <h1>Gestão de Serviços</h1>
        <div className="header-actions">
          <div className="search-box-v3">
            <input 
              type="text" 
              placeholder="Pesquisar serviço..." 
              className="glass-input"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />
          </div>
          <label className="checkbox-toggle">
            <input type="checkbox" checked={showDeletedServices} onChange={(e) => setShowDeletedServices(e.target.checked)} />
            <span>Ver Apagados</span>
          </label>
        </div>
      </div>

      <div className="bento-grid">
        {/* Create New Service Card */}
        <div className="bento-card glass-effect create-service-form">
          <h3>Novo Serviço</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = e.target;
            createService({ name: f.nm.value, duration: f.du.value, price: f.pr.value, category: f.cat.value, technician_id: parseInt(f.tid.value) });
            f.reset();
          }}>
            <input name="nm" placeholder="Nome do Serviço" className="glass-input" required />
            <div className="grid-split mt-2">
               <input name="du" placeholder="Duração (ex: 60 min)" className="glass-input" required />
               <input name="pr" placeholder="Preço (ex: 45€)" className="glass-input" required />
            </div>
            <select name="cat" className="glass-input mt-2">
               <option>Massagens</option><option>Cabeleireiro</option><option>Unhas</option><option>Terapias</option>
            </select>
            <select name="tid" className="glass-input mt-2">
               {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn-primary w-full mt-4">Adicionar Serviço</button>
          </form>
        </div>

        {services.map(s => {
          const list = s.checklist ? (typeof s.checklist === 'string' ? JSON.parse(s.checklist) : s.checklist) : [];
          const isDeleted = s.deleted_at !== null;
          return (
            <div key={s.id} className={`bento-card glass-effect ${isDeleted ? 'deleted-card' : ''}`}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, color: isDeleted ? '#666' : 'var(--primary)', fontWeight: 700 }}>{s.name}</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label className="checkbox-toggle" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                     <input type="checkbox" checked={s.vouchers_enabled} onChange={async (e) => {
                        const res = await fetch(`/api/services/${s.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
                          body: JSON.stringify({ vouchers_enabled: e.target.checked })
                        });
                        if ((await res.json()).success) { notify('Atualizado', 'Vouchers ' + (e.target.checked ? 'Ativos' : 'Desativados')); fetchServicesFromDB(); }
                     }} />
                     <span>Vouchers</span>
                   </label>
                   <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: isDeleted ? '#eee' : 'var(--primary-light)', color: isDeleted ? '#666' : 'var(--primary)' }}>{s.category}</span>
                 </div>
              </div>
              
              {!isDeleted ? (
                <>
                <div className="mt-4">
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Configurações Flash Deal:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Desconto (%)</label>
                      <input type="number" defaultValue={s.promo_discount || 10} className="glass-input" style={{ padding: '5px' }} onBlur={async (e) => {
                        const res = await fetch(`/api/services/${s.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
                          body: JSON.stringify({ promo_discount: parseInt(e.target.value) })
                        });
                        if ((await res.json()).success) { notify('Atualizado', 'Desconto promo guardado.'); fetchServicesFromDB(); }
                      }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Validade (min)</label>
                      <input type="number" defaultValue={s.promo_validity || 60} className="glass-input" style={{ padding: '5px' }} onBlur={async (e) => {
                        const res = await fetch(`/api/services/${s.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
                          body: JSON.stringify({ promo_validity: parseInt(e.target.value) })
                        });
                        if ((await res.json()).success) { notify('Atualizado', 'Validade promo guardada.'); fetchServicesFromDB(); }
                      }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Checklist de Preparação:</p>
                  <div className="checklist-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {list.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '5px 10px', borderRadius: '5px' }}>
                        <CheckSquare size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', flex: 1 }}>{item}</span>
                        <X size={14} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={async () => {
                          const newList = list.filter((_, i) => i !== idx);
                          const res = await fetch(`/api/services/${s.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
                            body: JSON.stringify({ checklist: newList })
                          });
                          if ((await res.json()).success) { notify('Removido', 'Item removido.'); fetchServicesFromDB(); }
                        }} />
                      </div>
                    ))}
                    <button className="btn-secondary" style={{ padding: '8px', fontSize: '0.8rem', borderStyle: 'dashed', background: 'transparent' }} onClick={async () => {
                      const newItem = prompt("Adicionar passo:");
                      if (newItem) {
                        const newList = [...list, newItem];
                        const res = await fetch(`/api/services/${s.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
                          body: JSON.stringify({ checklist: newList })
                        });
                        if ((await res.json()).success) { notify('Atualizado', 'Passo adicionado.'); fetchServicesFromDB(); }
                      }
                    }}>+ Adicionar Passo</button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>🎫 Vouchers Associados:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {vouchers.filter(v => v.service_id === s.id).map(v => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '4px 10px', borderRadius: '5px', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: v.is_used ? '#999' : 'var(--primary)' }}>{v.code}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ opacity: 0.6 }}>{v.discount_percent}%</span>
                          <span style={{ opacity: 0.8, color: '#666' }}>({v.current_uses}/{v.max_uses})</span>
                          <span style={{ padding: '2px 5px', borderRadius: '4px', fontSize: '10px', background: v.is_used ? '#eee' : '#e6fffa', color: v.is_used ? '#999' : '#2d5a27' }}>
                            {v.is_used ? 'ESGOTADO' : 'ATIVO'}
                          </span>
                          <X size={12} style={{ cursor: 'pointer', opacity: 0.4 }} onClick={() => deleteVoucher(v.id)} />
                        </div>
                      </div>
                    ))}
                    <button className="btn-secondary" style={{ padding: '6px', fontSize: '0.75rem', borderStyle: 'dotted' }} onClick={() => {
                      const code = prompt("Código do Voucher (ex: PROMO-AYURVIP):")?.toUpperCase();
                      const disc = prompt("Desconto (%):", "15");
                      const uses = prompt("Número total de utilizações (ex: 10):", "1");
                      if (code && disc && uses) {
                        const fut = new Date(); fut.setMonth(fut.getMonth() + 1);
                        createManualVoucher({ code, discount: parseInt(disc), service_id: s.id, expires_at: fut.toISOString().slice(0, 19).replace('T', ' '), max_uses: parseInt(uses) });
                      }
                    }}>+ Criar Voucher Manual</button>
                  </div>
                </div>

                <button className="btn-secondary w-full mt-4" style={{ color: '#ef4444' }} onClick={() => softDeleteService(s.id)}>Eliminar Serviço</button>
                </>
              ) : (
                <div className="deleted-actions mt-4">
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#999' }}>Serviço removido em {new Date(s.deleted_at).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn-primary w-full" onClick={() => restoreService(s.id)}>Restaurar</button>
                    <button className="btn-secondary w-full" style={{ color: '#ef4444' }} onClick={() => hardDeleteService(s.id)}>Apagar Permanente</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesTab;
