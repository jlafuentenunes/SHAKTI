import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Menu,
  X,
  Mail
} from 'lucide-react';

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

import './App.css';

const services = [
  { id: 1, name: 'Ayurveda Abhyanga', duration: '60 min', price: '65€', category: 'Massagens' },
  { id: 2, name: 'Corte & Styling', duration: '45 min', price: '35€', category: 'Cabeleireiro' },
  { id: 3, name: 'Manicure Gelinho', duration: '60 min', price: '25€', category: 'Unhas' },
  { id: 4, name: 'Terapia Xamânica', duration: '90 min', price: '80€', category: 'Terapias' },
];

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '2026-04-05',
    time: ''
  });
  const [view, setView] = useState('client'); // 'client' or 'admin'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('shakti-token'));
  const [loginForm, setLoginForm] = useState({ user: '', password: '' });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Informações Gerais',
    message: ''
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': localStorage.getItem('shakti-token') }
      });
      const data = await response.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    if (view === 'admin' && isLoggedIn) {
      fetchAppointments();
    }
  }, [view, isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('shakti-token', data.token);
        setIsLoggedIn(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shakti-token');
    setIsLoggedIn(false);
    setView('client');
  };

  useEffect(() => {
    if (bookingStep === 2 && formData.date) {
      fetch(`/api/bookings/busy?date=${formData.date}`)
        .then(res => res.json())
        .then(data => setBusySlots(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching slots:", err));
    }
  }, [formData.date, bookingStep]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openBooking = (service = null) => {
    setSelectedService(service);
    setIsBookingOpen(true);
    setBookingStep(1);
  };

  const nextStep = () => setBookingStep(prev => prev + 1);
  const prevStep = () => setBookingStep(prev => prev - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedService?.name
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Reserva confirmada! Receberá um contacto em breve.');
        setIsBookingOpen(false);
        setBookingStep(1);
        setFormData({ name: '', email: '', phone: '', date: '2026-04-05', time: '' });
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Erro ao processar reserva. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Mensagem enviada! Entraremos em contacto brevemente.');
        setContactForm({ name: '', email: '', subject: 'Informações Gerais', message: '' });
      }
    } catch (error) {
      console.error('Contact error:', error);
      alert('Erro ao enviar mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'admin') {
    return (
      <div className="admin-container">
        {!isLoggedIn ? (
          <div className="admin-login-box">
            <h2>Shakti Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Utilizador</label>
                <input type="text" className="input-field" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Palavra-passe</label>
                <input type="password" className="input-field" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              </div>
              <button className="btn-primary w-full" disabled={isSubmitting}>Entrar</button>
              <button type="button" className="btn-secondary w-full mt-2" onClick={() => setView('client')}>Sair para o Site</button>
            </form>
          </div>
        ) : (
          <div className="admin-dashboard">
            <header className="admin-header">
              <h1>Painel de Reservas</h1>
              <div className="admin-actions">
                <button className="btn-secondary" onClick={fetchAppointments}>Atualizar</button>
                <button className="btn-primary" onClick={handleLogout}>Sair</button>
              </div>
            </header>
            <div className="admin-stats mt-4">
              <div className="admin-stat-card">
                <h3>Total</h3>
                <p>{appointments.length}</p>
              </div>
            </div>
            <div className="admin-table-container mt-4">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td>{a.booking_date} às {a.booking_time}</td>
                      <td>
                        <strong>{a.customer_name}</strong><br/>
                        <small>{a.customer_email}</small>
                      </td>
                      <td>{a.service_name}</td>
                      <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="logo">SHAKTI<span>HOME</span></div>
          <div className="nav-links">
            <a href="#services">Serviços</a>
            <a href="#about">Sobre nós</a>
            <a href="#contact">Contactos</a>
            <button className="btn-primary" onClick={() => openBooking()}>Reservar Agora</button>
          </div>
          <button className="mobile-menu-btn"><Menu /></button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container animate">
          <span className="hero-tag">Apúlia Coast Wellness</span>
          <h1>Equilíbrio entre corpo, mente e alma.</h1>
          <p>Um refúgio de serenidade onde a tradição Ayurveda encontra a estética moderna.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => openBooking()}>Agendar Tratamento</button>
            <button className="btn-secondary">Explorar Serviços</button>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="services container">
        <div className="section-head">
          <h2>Nossos Serviços</h2>
          <p>Escolha o tratamento ideal para o seu momento.</p>
        </div>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card animate">
              <div className="service-info">
                <span className="category">{service.category}</span>
                <h3>{service.name}</h3>
                <div className="service-meta">
                  <span><Clock size={16} /> {service.duration}</span>
                  <span>{service.price}</span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => openBooking(service)}>
                <ChevronRight />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about section-spacing">
        <div className="container about-grid">
          <div className="about-image animate">
            <div className="image-stack">
              <img src="https://images.unsplash.com/photo-1544161515-436cead21ef9?auto=format&fit=crop&q=80&w=1000" alt="Ayurveda Treatment" className="img-large" />
              <div className="image-accent"></div>
            </div>
          </div>
          <div className="about-text animate">
            <span className="category">A Nossa Essência</span>
            <h2>O Seu Refúgio de Bem-Estar na Costa de Apúlia</h2>
            <p>
              Na Shakti Home, acreditamos no equilíbrio holístico. Situados na belíssima vila de Apúlia, combinamos técnicas ancestrais de Ayurveda com as tendências modernas de estética e bem-estar.
            </p>
            <p>
              O nosso espaço foi concebido como um santuário de serenidade, onde cada detalhe é pensado para proporcionar uma experiência de calma e rejuvenescimento total.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <strong>10+</strong>
                <span>Anos de Experiência</span>
              </div>
              <div className="stat-item">
                <strong>500+</strong>
                <span>Clientes Felizes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact section-spacing bg-light">
        <div className="container">
          <div className="section-head">
            <span className="category">Dúvidas ou Sugestões?</span>
            <h2>Entre em Contacto</h2>
          </div>
          
          <div className="contact-wrapper">
            <div className="contact-info animate">
              <div className="contact-card">
                <div className="icon-box"><MapPin /></div>
                <div>
                  <h4>Onde Estamos</h4>
                  <p>Av. da Praia 44, Apúlia, Portugal</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-box"><Phone /></div>
                <div>
                  <h4>Telefone</h4>
                  <p>+351 912 345 678</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-box"><Mail /></div>
                <div>
                  <h4>Email</h4>
                  <p>geral@shaktihome.pt</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-box"><Clock /></div>
                <div>
                  <h4>Horário</h4>
                  <p>Seg - Sáb: 09:00 - 19:00</p>
                </div>
              </div>
            </div>

            <form className="contact-form animate" onSubmit={handleContactSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome" 
                    className="input-field" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="input-field" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Assunto</label>
                <select 
                  className="input-field" 
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <option>Informações Gerais</option>
                  <option>Marcação de Grupo</option>
                  <option>Eventos & Parcerias</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea 
                  placeholder="Como podemos ajudar?" 
                  className="input-field" 
                  rows="4"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate">
            <button className="close-btn" onClick={() => setIsBookingOpen(false)}><X /></button>
            
            <div className="booking-stepper">
              <div className={`step ${bookingStep >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step ${bookingStep >= 2 ? 'active' : ''}`}>2</div>
              <div className="step-line"></div>
              <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>3</div>
            </div>

            {bookingStep === 1 && (
              <div className="step-content">
                <h3>Escolha o Serviço</h3>
                <div className="selection-list">
                  {services.map(s => (
                    <div 
                      key={s.id} 
                      className={`selection-item ${selectedService?.id === s.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(s)}
                    >
                      <div>
                        <strong>{s.name}</strong>
                        <p>{s.category} • {s.duration}</p>
                      </div>
                      <span>{s.price}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary w-full mt-4" disabled={!selectedService} onClick={nextStep}>
                  Continuar
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="step-content">
                <h3>Data e Hora</h3>
                <div className="calendar-selection">
                  <div className="date-input-wrapper">
                    <label>Selecione o Dia:</label>
                    <input 
                      type="date" 
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, time: '' }))}
                    />
                  </div>
                  <p className="mt-4">Horários Disponíveis:</p>
                  <div className="time-grid">
                    {['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'].map(t => {
                      const isBusy = busySlots.includes(t);
                      return (
                        <button 
                          key={t} 
                          disabled={isBusy}
                          className={`time-btn ${formData.time === t ? 'selected' : ''} ${isBusy ? 'busy' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                        >
                          {t}
                          {isBusy && <span className="busy-tag">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={prevStep}>Voltar</button>
                  <button className="btn-primary" disabled={!formData.time} onClick={nextStep}>Confirmar Data</button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="step-content text-center">
                <CheckCircle2 size={64} className="success-icon" />
                <h3>Dados de Contacto</h3>
                <p>Quase lá! Insira os seus dados para confirmarmos o agendamento.</p>
                <div className="form-group mt-4 text-left">
                  <label>Nome Completo</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome" 
                    className="input-field" 
                  />
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com" 
                    className="input-field" 
                  />
                  <label>Telemóvel</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+351 9xx xxx xxx" 
                    className="input-field" 
                  />
                </div>
                <button 
                  className="btn-primary w-full mt-4" 
                  disabled={isSubmitting || !formData.name || !formData.email} 
                  onClick={handleBookingSubmit}
                >
                  {isSubmitting ? 'A processar...' : 'Confirmar e Agendar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="logo white">SHAKTI<span>HOME</span></div>
            <p>O seu espaço de bem-estar em Apúlia.</p>
          </div>
          <div className="footer-info">
            <div className="info-item"><MapPin size={18} /> Av. da Praia 44, Apúlia</div>
            <div className="info-item"><Phone size={18} /> +351 912 345 678</div>
          </div>
          <div className="footer-social">
            <Instagram />
            <Facebook />
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Shakti Home. Todos os direitos reservados.</p>
          <button className="admin-access-btn" onClick={() => setView('admin')}>Admin Portal</button>
        </div>
      </footer>
    </div>
  );
}

export default App;
