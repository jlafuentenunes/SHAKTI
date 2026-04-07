import React from 'react';
import { Info } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="about-section glass-effect container my-24 py-24 rounded-3xl animate">
      <div className="about-grid">
        <div className="about-image">
          <div className="image-stack">
            <div className="img-large rounded-2xl overflow-hidden shadow-xl">
               <img src="https://images.unsplash.com/photo-1620733723572-12c03f99e326?auto=format&fit=crop&q=80&w=800" alt="Spa" />
            </div>
            <div className="img-small floating rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
               <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=400" alt="Ayurveda" />
            </div>
          </div>
        </div>
        <div className="about-content p-12">
          <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-widest uppercase text-xs">
            <Info size={14} /> Ayurveda & Estética
          </div>
          <h2>Um porto de abrigo para os seus sentidos.</h2>
          <p className="mt-6 text-gray-600 leading-relaxed">
            Situada no coração da Apúlia, a Shakti Home nasceu do desejo de criar um espaço onde o tempo parece parar. Combinamos técnicas milenares com a estética contemporânea para oferecer resultados visíveis e uma paz profunda.
          </p>
          <div className="stats-row grid grid-cols-2 gap-8 mt-12">
            <div className="stat-item border-l-2 border-primary pl-4">
              <span className="block text-3xl font-bold text-primary">5+</span>
              <span className="text-gray-500 text-sm">Anos de Experiência</span>
            </div>
            <div className="stat-item border-l-2 border-primary pl-4">
              <span className="block text-3xl font-bold text-primary">1k+</span>
              <span className="text-gray-500 text-sm">Clientes Satisfeitos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
