import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Hero = ({ scrolled, onBooking, onMirror }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-content px-4">
          <div className="logo font-bold">SHAKTI<span className="text-primary-light">HOME</span></div>
          
          <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
            {isMenuOpen && (
              <div className="mobile-header flex justify-between items-center w-full p-6 border-b border-gray-100">
                <div className="logo font-bold">SHAKTI<span>HOME</span></div>
                <button onClick={toggleMenu}><X size={24} /></button>
              </div>
            )}
            <a href="#services" onClick={() => setIsMenuOpen(false)}>Serviços</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>Sobre nós</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contactos</a>
            <button className="btn-primary w-full md:w-auto" onClick={() => { onBooking(); setIsMenuOpen(false); }}>Reservar Agora</button>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container animate">
          <span className="hero-tag">Apúlia Coast Wellness</span>
          <h1>Equilíbrio entre corpo, mente e alma.</h1>
          <p>Um refúgio de serenidade onde a tradição Ayurveda encontra a estética moderna.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => onBooking()}>Agendar Tratamento</button>
            <button className="btn-secondary" onClick={() => onMirror(true)}>✨ Look Virtual (AI)</button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Hero;
