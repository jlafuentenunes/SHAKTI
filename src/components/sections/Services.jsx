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
              <div key={service.id} className="service-card glass-effect hover-float">
                <div className="service-img-wrapper">
                  <img 
                    src={service.image_url || 'https://images.unsplash.com/photo-1544161515-4af6b1d8e1a9?auto=format&fit=crop&q=80&w=400'} 
                    alt={service.name} 
                    className="service-img"
                  />
                </div>
                <div className="service-body">
                  <div className="service-header">
                    <h4>{service.name}</h4>
                    <span className="price">{service.price}</span>
                  </div>
                  <p className="service-desc">{service.duration} de puro relaxamento e bem-estar.</p>
                  <button className="service-btn w-full btn-secondary" onClick={() => onBooking(service)}>
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
