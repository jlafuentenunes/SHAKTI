import React from 'react';
import { ChevronRight } from 'lucide-react';

const Services = ({ services, onBooking }) => {
  const categories = [...new Set(services.filter(s => !s.deleted_at).map(s => s.category))];

  return (
    <section id="services" className="services-section container py-24">
      <div className="section-header text-center mb-16 animate">
        <span className="subtitle">Nossa Coleção</span>
        <h2>Tratamentos Extraordinários</h2>
        <div className="accent-line"></div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="category-group mb-12">
          <h3 className="category-title">{cat}</h3>
          <div className="services-grid">
            {services.filter(s => s.category === cat && !s.deleted_at).map(service => (
              <div key={service.id} className="service-card glass-effect hover-float flex-col items-start gap-4" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="service-img-wrapper w-full" style={{ height: '180px', overflow: 'hidden' }}>
                  <img 
                    src={service.image_url || 'https://images.unsplash.com/photo-1544161515-4af6b1d8e1a9?auto=format&fit=crop&q=80&w=400'} 
                    alt={service.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="service-body p-6 w-full">
                  <div className="service-header flex justify-between items-center mb-2">
                    <h4 className="m-0 text-lg font-bold">{service.name}</h4>
                    <span className="price font-medium text-primary">{service.price}</span>
                  </div>
                  <p className="service-desc text-sm text-gray-500 mb-6">{service.duration} de puro relaxamento e bem-estar.</p>
                  <button className="service-btn w-full btn-secondary text-sm py-3" onClick={() => onBooking(service)}>
                    Reservar <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Services;
