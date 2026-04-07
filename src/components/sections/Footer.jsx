import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const Instagram = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Footer = ({ onAdminLogin }) => {
  return (
    <footer className="footer bg-gray-900 text-white py-24">
      <div className="container footer-content grid grid-cols-1 md:grid-cols-3 gap-16 px-4">
        <div className="footer-brand space-y-6">
          <div className="logo white text-2xl font-bold flex items-center gap-2">
            SHAKTI<span className="text-primary-light">HOME</span>
          </div>
          <p className="text-gray-400 leading-relaxed font-light">
            O seu santuário de bem-estar na costa da Apúlia. Onde a alma descansa e o corpo renova.
          </p>
          <div className="footer-social flex gap-6">
            <Instagram size={20} className="text-gray-400 hover:text-white transition-colors cursor-pointer" />
            <Facebook size={20} className="text-gray-400 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
        <div className="footer-links space-y-4">
           <h4 className="font-bold text-lg mb-8">Navegação</h4>
           <div className="flex flex-col gap-4 text-gray-400">
             <a href="#services" className="hover:text-primary-light transition-colors">Tratamentos</a>
             <a href="#about" className="hover:text-primary-light transition-colors">A nossa História</a>
             <a href="#contact" className="hover:text-primary-light transition-colors">Localização</a>
           </div>
        </div>
        <div className="footer-info space-y-6">
          <h4 className="font-bold text-lg mb-8">Contactos</h4>
          <div className="info-item flex gap-4 items-center text-gray-400 border-b border-white/5 pb-4">
            <div className="bg-white/5 p-2 rounded-lg"><MapPin size={18} /></div>
            <span>Av. da Praia 44, Apúlia, Portugal</span>
          </div>
          <div className="info-item flex gap-4 items-center text-gray-400 border-b border-white/5 pb-4">
            <div className="bg-white/5 p-2 rounded-lg"><Phone size={18} /></div>
            <span>+351 912 345 678</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom mt-24 pt-12 border-t border-white/5 text-center text-gray-500 font-light text-sm">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <p>© 2026 Shakti Home. Todos os direitos reservados.</p>
          <button className="admin-access-btn text-xs tracking-widest uppercase hover:text-white transition-colors border border-white/10 px-6 py-2 rounded-full" onClick={onAdminLogin}>
            Portal Administrativo
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
