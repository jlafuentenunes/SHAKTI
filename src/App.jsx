import React, { useState, useEffect, useMemo } from 'react';
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
  Mail,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Info,
  AlertTriangle,
  CheckSquare,
  Package,
  Zap
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

// services will be loaded from DB

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
  const [adminTab, setAdminTab] = useState('table'); // 'table' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [userRole, setUserRole] = useState(localStorage.getItem('shakti-role') || 'client');
  const [userTechId, setUserTechId] = useState(localStorage.getItem('shakti-tech-id'));
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showDeletedServices, setShowDeletedServices] = useState(false);
  const [blockouts, setBlockouts] = useState([]);
  const [settings, setSettings] = useState({ calendar_start: '09:00', calendar_end: '19:00', slot_duration: 90 });
  const [selectedCalendarTechId, setSelectedCalendarTechId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Informações Gerais',
    message: ''
  });

  const [toasts, setToasts] = useState([]);

  const notify = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handlePromote = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}/promote`, {
        method: 'POST',
        headers: { 'Authorization': 'fake-jwt-shakti-admin' }
      });
      const data = await res.json();
      if (data.success) {
        notify('Promovido!', data.message);
      } else {
        notify('Erro na Promoção', data.message, 'error');
      }
    } catch (err) {
      notify('Erro de Ligação', 'Não foi possível promover a vaga.', 'error');
    }
  };

  const validateVoucher = async () => {
    if (!promoCode) return;
    try {
      const res = await fetch(`/api/vouchers/validate?code=${promoCode}`);
      const data = await res.json();
      if (data.success) {
        setDiscountPercent(data.discount);
        notify('Voucher Aplicado!', `${data.discount}% de desconto aplicado.`);
      } else {
        notify('Inválido', data.message, 'error');
        setDiscountPercent(0);
      }
    } catch (err) {
      notify('Erro', 'Não foi possível validar o código.', 'error');
    }
  };

  const handlePromoteEmpty = async (date, time) => {
    const sId = prompt("ID do Serviço a promover (1: Ayurveda, 2: Corte, 3: Manicure, 4: Terapia):", "1");
    if (!sId) return;
    try {
      const res = await fetch('/api/vouchers/promote-empty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
        body: JSON.stringify({ serviceId: sId, date, time })
      });
      const data = await res.json();
      if (data.success) {
        notify('Slot Promovido!', data.message);
      } else {
        notify('Erro na Promoção', data.message, 'error');
      }
    } catch (err) {
      notify('Erro de Ligação', 'Não foi possível promover o slot.', 'error');
    }
  };

  const timeSlots = useMemo(() => {
    if (!settings.calendar_start || !settings.calendar_end) return [];
    const slots = [];
    try {
      let [h, m] = settings.calendar_start.split(':').map(Number);
      const [eh, em] = settings.calendar_end.split(':').map(Number);
      const endMinutes = eh * 60 + em;
      let currentMinutes = h * 60 + m;
      
      while (currentMinutes < endMinutes) {
        const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const mm = String(currentMinutes % 60).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
        currentMinutes += parseInt(settings.slot_duration);
      }
    } catch(e) { console.error(e); }
    return slots;
  }, [settings]);

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

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/technicians');
      const data = await response.json();
      if (Array.isArray(data)) setTechnicians(data);
    } catch (err) {
      console.error("Error fetching techs:", err);
    }
  };

  const fetchBlockouts = async () => {
    try {
      const response = await fetch('/api/blockouts');
      const data = await response.json();
      if (Array.isArray(data)) setBlockouts(data);
    } catch (err) {
      console.error("Error fetching blockouts:", err);
    }
  };

  const fetchServicesFromDB = async () => {
    try {
      const response = await fetch(`/api/services?search=${serviceSearch}&showDeleted=${showDeletedServices}`);
      const data = await response.json();
      if (Array.isArray(data)) setServices(data);
    } catch (err) { console.error("Error fetching services:", err); }
  };

  useEffect(() => {
    fetchServicesFromDB();
  }, [serviceSearch, showDeletedServices]);

  const createService = async (serviceData) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
        body: JSON.stringify(serviceData)
      });
      const data = await res.json();
      if (data.success) { notify('Sucesso', 'Serviço criado!'); fetchServicesFromDB(); }
    } catch (err) { notify('Erro', 'Falha ao criar serviço.', 'error'); }
  };

  const softDeleteService = async (id) => {
    try {
      const res = await fetch(`/api/services/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'fake-jwt-shakti-admin' } 
      });
      if ((await res.json()).success) { notify('Removido', 'Serviço movido para o lixo.'); fetchServicesFromDB(); }
    } catch (err) { notify('Erro', 'Não foi possível apagar.', 'error'); }
  };

  const restoreService = async (id) => {
    try {
      const res = await fetch(`/api/services/${id}/restore`, { 
        method: 'POST', 
        headers: { 'Authorization': 'fake-jwt-shakti-admin' } 
      });
      if ((await res.json()).success) { notify('Restaurado', 'Serviço ativo novamente!'); fetchServicesFromDB(); }
    } catch (err) { notify('Erro', 'Falha no restauro.', 'error'); }
  };

  const hardDeleteService = async (id) => {
    if (!confirm('Eliminar definitivamente?')) return;
    try {
      const res = await fetch(`/api/services/${id}/permanent`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'fake-jwt-shakti-admin' } 
      });
      if ((await res.json()).success) { notify('Eliminado', 'Serviço removido permanentemente.'); fetchServicesFromDB(); }
    } catch (err) { notify('Erro', 'Erro ao eliminar.', 'error'); }
  };

  const handleBlockSlot = async (techId, date, time) => {
    const reason = prompt("Razão do bloqueio (ex: Pausa, Férias):");
    if (!reason) return;
    try {
      const res = await fetch('/api/blockouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('shakti-token')
        },
        body: JSON.stringify({ technician_id: techId, date, time, reason })
      });
      const data = await res.json();
      if (data.success) {
        fetchBlockouts();
      }
    } catch (err) {
      notify('Erro', 'Não foi possível bloquear este horário.', 'error');
    }
  };

  const updateHourlyRate = async (id, rate) => {
    try {
      const res = await fetch(`/api/technicians/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('shakti-token') },
        body: JSON.stringify({ hourly_rate: rate })
      });
      if ((await res.json()).success) {
        notify('Taxa Atualizada', 'O valor hora do técnico foi gravado.');
        fetchTechnicians();
      }
    } catch (err) { notify('Erro', 'Não foi possível atualizar a taxa.', 'error'); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('shakti-token') },
        body: JSON.stringify({ status })
      });
      if ((await res.json()).success) {
        notify('Estado Alterado', `Reserva marcada como ${status}.`);
        fetchAppointments();
      }
    } catch (err) { notify('Erro', 'Erro ao atualizar reserva.', 'error'); }
  };

  useEffect(() => {
    fetchSettings();
    fetchServicesFromDB();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('shakti-token')
        },
        body: JSON.stringify(newSettings)
      });
      if ((await res.json()).success) {
        notify('Definições Guardadas', 'O horário do estúdio foi atualizado.');
        fetchSettings();
      }
    } catch (err) {
      notify('Erro', 'Não foi possível gravar as novas definições.', 'error');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data && data.calendar_start) setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

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
        localStorage.setItem('shakti-role', data.role);
        if (data.technicianId) localStorage.setItem('shakti-tech-id', data.technicianId);
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserTechId(data.technicianId);
        notify('Bem-vindo', `Sessão iniciada como ${data.role}.`);
      } else {
        notify('Login Falhou', data.message || 'Credenciais inválidas.', 'error');
      }
    } catch (err) {
      notify('Erro de Servidor', 'Não foi possível ligar ao sistema.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shakti-token');
    localStorage.removeItem('shakti-role');
    localStorage.removeItem('shakti-tech-id');
    setIsLoggedIn(false);
    setUserRole('client');
    setUserTechId(null);
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
          service: selectedService?.name,
          technician: selectedService?.technician_id,
          voucherCode: promoCode
        })
      });
      
      const data = await response.json();
      if (data.success) {
        notify('Reserva Efetuada', 'Receberá um contacto em breve para confirmação.');
        setIsBookingOpen(false);
        setBookingStep(1);
        setFormData({ name: '', email: '', phone: '', date: calendarDate, time: '' });
        setPromoCode('');
        setDiscountPercent(0);
      } else {
        notify('Agendamento Negado', data.message || 'Horário indisponível.', 'error');
      }
    } catch (error) {
      notify('Erro de Ligação', 'Não foi possível comunicar com o servidor.', 'error');
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
        notify('Mensagem Enviada', 'Obrigado pelo seu contacto.');
        setContactForm({ name: '', email: '', subject: 'Informações Gerais', message: '' });
      }
    } catch (error) {
      notify('Erro no Envio', 'Não foi possível enviar a mensagem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'admin') {
    return (
      <div className="admin-container">
        {!isLoggedIn ? (
          <div className="admin-login-box-wrapper w-full">
            <div className="admin-login-box animate-in">
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
                <button type="button" className="btn-secondary w-full mt-2" onClick={() => setView('client')}>Voltar ao Site</button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <aside className="admin-sidebar glass-effect">
              <div className="sidebar-logo">SHAKTI<span>HOME</span></div>
              <nav className="side-nav">
                <button className={`side-btn ${adminTab === 'table' ? 'active' : ''}`} onClick={() => setAdminTab('table')}>
                  <LayoutDashboard size={20} /> <span>Marcações</span>
                </button>
                <button className={`side-btn ${adminTab === 'calendar' ? 'active' : ''}`} onClick={() => setAdminTab('calendar')}>
                  <Calendar size={20} /> <span>Agenda</span>
                </button>
                {userRole === 'admin' && (
                  <button className={`side-btn ${adminTab === 'technicians' ? 'active' : ''}`} onClick={() => setAdminTab('technicians')}>
                    <Users size={20} /> <span>Técnicos</span>
                  </button>
                )}
                {userRole === 'admin' && (
                  <button className={`side-btn ${adminTab === 'services' ? 'active' : ''}`} onClick={() => setAdminTab('services')}>
                    <Package size={20} /> <span>Serviços</span>
                  </button>
                )}
                {userRole === 'admin' && (
                  <button className={`side-btn ${adminTab === 'settings' ? 'active' : ''}`} onClick={() => setAdminTab('settings')}>
                    <Settings size={20} /> <span>Definições</span>
                  </button>
                )}
              </nav>
              <div className="sidebar-footer">
                <button className="side-btn" onClick={fetchAppointments}>
                  <RefreshCcw size={20} /> <span>Atualizar</span>
                </button>
                <button className="side-btn text-danger" onClick={handleLogout}>
                  <LogOut size={20} /> <span>Sair</span>
                </button>
              </div>
            </aside>

            <main className="admin-main">
              <header className="admin-page-header">
                <h1>{adminTab === 'table' ? 'Gestão de Reservas' : 
                     adminTab === 'calendar' ? 'Calendário de Estúdio' : 
                     adminTab === 'technicians' ? 'Gestão de Talentos' : 'Configurações'}</h1>
                <p className="subtitle">Bons tratamentos, {userRole === 'admin' ? 'Administrador' : technicians.find(t => t.id == userTechId)?.name || 'Técnico'}.</p>
              </header>

              <div className="admin-content-area">
                {adminTab === 'table' && (
                  <>
                  <div className="bento-stats animate-in">
                    {/* ... stats cards ... */}
                    <div className="bento-card">
                      <h3>Total de Reservas</h3>
                      <div className="stat-value">{appointments.length}</div>
                      <div className="stat-trend"><TrendingUp size={14}/> +2% hoje</div>
                    </div>
                    <div className="bento-card primary">
                      <h3>Confirmadas</h3>
                      <div className="stat-value">{appointments.filter(a => a.status === 'confirmed').length}</div>
                      <div className="stat-trend">Marcações ativas</div>
                    </div>
                    {userRole === 'admin' && (
                      <div className="bento-card">
                        <h3>Ganhos Totais</h3>
                        <div className="stat-value">
                          {appointments.filter(a => a.status === 'confirmed').reduce((acc, curr) => {
                            const tech = technicians.find(t => t.id == curr.technician_id);
                            const service = services.find(s => s.name === curr.service_name);
                            const hours = service ? (parseFloat(service.duration) / 60) : 1;
                            return acc + (hours * (tech?.hourly_rate || 0));
                          }, 0).toFixed(2)}€
                        </div>
                        <div className="stat-trend"><DollarSign size={14}/> Previsão semanal</div>
                      </div>
                    )}
                  </div>

                  {/* Standard Table (Desktop) */}
                  <div className="admin-table-container glass-effect animate-in">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Data/Hora</th>
                          <th>Cliente</th>
                          <th>Serviço/Técnico</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(a => (
                          <tr key={a.id}>
                            <td>
                              <div className="date-cell">
                                <strong>{a.booking_date}</strong>
                                <span>{a.booking_time}</span>
                              </div>
                            </td>
                            <td>
                              <div className="customer-cell">
                                <strong>{a.customer_name}</strong>
                                <div className="contact-small">
                                  <small><Mail size={12}/> {a.customer_email}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="service-cell">
                                <strong>{a.service_name}</strong>
                                <span className="tech-badge">{technicians.find(t => t.id == a.technician_id)?.name || 'Sem técnico'}</span>
                              </div>
                            </td>
                            <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                            <td>
                              <div className="admin-actions-cell">
                                {a.status === 'pending' && <button className="action-btn confirm" title="Confirmar" onClick={() => updateBookingStatus(a.id, 'confirmed')}><CheckCircle2 size={18} /></button>}
                                {a.status !== 'cancelled' && <button className="action-btn cancel" title="Cancelar" onClick={() => confirm('Deseja cancelar?') && updateBookingStatus(a.id, 'cancelled')}><X size={18} /></button>}
                                {a.status === 'cancelled' && <button className="action-btn" title="Promover Vaga" style={{ background: 'var(--primary)', color: 'white' }} onClick={() => handlePromote(a.id)}><TrendingUp size={18} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards (Phones) */}
                  <div className="admin-mobile-cards animate-in">
                    {appointments.map(a => (
                      <div key={a.id} className="mobile-booking-card glass-effect">
                        <div className="mobile-card-row">
                          <span className="mobile-card-label">Cliente</span>
                          <span className="mobile-card-value">{a.customer_name}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-card-label">Data / Hora</span>
                          <span className="mobile-card-value">{a.booking_date} às {a.booking_time}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-card-label">Serviço</span>
                          <span className="mobile-card-value">{a.service_name}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-card-label">Técnico</span>
                          <span className="mobile-card-value">{technicians.find(t => t.id == a.technician_id)?.name || 'N/A'}</span>
                        </div>
                        <div className="mobile-card-row">
                          <span className="mobile-card-label">Status</span>
                          <span className={`status-badge ${a.status}`}>{a.status}</span>
                        </div>
                        {services.find(s => s.name === a.service_name)?.checklist ? (
                          <div className="mobile-card-checklist mt-2" style={{ background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '10px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', color: 'var(--text-muted)' }}>Checklist do Serviço</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {JSON.parse(services.find(s => s.name === a.service_name).checklist).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                  <CheckSquare size={12} color="var(--primary)" /> {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <div className="mobile-card-actions">
                          {a.status === 'pending' && (
                             <button className="btn-primary w-full" onClick={() => updateBookingStatus(a.id, 'confirmed')}>Confirmar</button>
                          )}
                          {a.status !== 'cancelled' && (
                             <button className="btn-secondary w-full" onClick={() => confirm('Cancelar?') && updateBookingStatus(a.id, 'cancelled')}>Cancelar</button>
                          )}
                          {a.status === 'cancelled' && (
                             <button className="btn-secondary w-full" style={{ background: '#2d5a27', color: 'white' }} onClick={() => handlePromote(a.id)}>
                               <TrendingUp size={16} /> Promover Vaga (Flash Deal)
                             </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  </>
                )}

                {adminTab === 'calendar' && (
                  <div className="calendar-panel-glass animate-in">
                    <div className="calendar-header-compact">
                      <div className="date-nav-mod">
                        <button onClick={() => {
                          const d = new Date(calendarDate); d.setDate(d.getDate() - 1); setCalendarDate(d.toISOString().split('T')[0]);
                        }}><ChevronLeft/></button>
                        <input type="date" value={calendarDate} onChange={e => setCalendarDate(e.target.value)} className="date-picker-clean" />
                        <button onClick={() => {
                          const d = new Date(calendarDate); d.setDate(d.getDate() + 1); setCalendarDate(d.toISOString().split('T')[0]);
                        }}><ChevronRight/></button>
                      </div>
                    </div>

                    {userRole === 'admin' && (
                      <div className="tech-pills-container">
                        {technicians.map(t => (
                          <button key={t.id} className={`tech-pill ${selectedCalendarTechId == t.id ? 'active' : ''}`} onClick={() => setSelectedCalendarTechId(t.id)}>
                            {t.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="calendar-viewport glass-effect">
                      <div className="calendar-grid" style={{
                        gridTemplateColumns: `80px repeat(${(!isMobile && userRole === 'admin') ? technicians.length : 1}, 1fr)`
                      }}>
                        <div className="grid-times">
                          <div className="grid-header-cell">Hora</div>
                          {timeSlots.map(t => <div key={t} className="time-slot-label">{t}</div>)}
                        </div>
                        {technicians
                          .filter(t => (userRole === 'admin' ? (!isMobile || t.id == selectedCalendarTechId) : t.id == userTechId))
                          .map(tech => (
                            <div key={tech.id} className="grid-column">
                              <div className="grid-header-cell">{tech.name}</div>
                              {timeSlots.map(t => {
                                const ap = appointments.find(a => a.booking_date === calendarDate && a.booking_time === t && a.technician_id == tech.id && a.status !== 'cancelled');
                                const bl = blockouts.find(b => b.block_date === calendarDate && b.block_time === t && b.technician_id == tech.id);
                                return (
                                  <div key={t} className={`grid-slot ${ap ? 'occupied' : bl ? 'blocked' : 'empty'}`}
                                       onClick={() => !ap && !bl && handleBlockSlot(tech.id, calendarDate, t)}>
                                    {ap ? (
                                      <div className={`ap-card ${ap.status}`}>
                                        <strong>{ap.service_name}</strong>
                                        <span>{ap.customer_name}</span>
                                        {services.find(s => s.name === ap.service_name)?.checklist && (
                                          <div className="ap-card-checklist" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>
                                            {JSON.parse(services.find(s => s.name === ap.service_name).checklist).slice(0, 2).map((item, i) => (
                                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <CheckSquare size={8} /> {item}
                                              </div>
                                            ))}
                                            {JSON.parse(services.find(s => s.name === ap.service_name).checklist).length > 2 && <div>+{JSON.parse(services.find(s => s.name === ap.service_name).checklist).length - 2} mais...</div>}
                                          </div>
                                        )}
                                      </div>
                                    ) : bl ? <div className="bl-card"><span>INDISPONÍVEL</span></div> : (
                                      <div className="slot-add">
                                        <span onClick={() => handleBlockSlot(tech.id, calendarDate, t)}>+</span>
                                        {userRole === 'admin' && (
                                          <button className="promo-inline-btn" title="Promover este horário" onClick={(e) => { e.stopPropagation(); handlePromoteEmpty(calendarDate, t); }}>
                                            <Zap size={14} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === 'services' && (
                  <div className="services-mgmt-layout animate-in">
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
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: isDeleted ? '#eee' : 'var(--primary-light)', color: isDeleted ? '#666' : 'var(--primary)' }}>{s.category}</span>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                )}

                {adminTab === 'technicians' && (
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
                )}

                {adminTab === 'settings' && (
                  <div className="settings-layout-v3 animate-in">
                    <div className="glass-card p-8 max-w-2xl">
                      <h3>Configurações Globais</h3>
                      <form className="mt-6" onSubmit={e => {
                        e.preventDefault();
                        updateSettings({ calendar_start: e.target.s.value, calendar_end: e.target.e.value, slot_duration: e.target.d.value });
                      }}>
                        <div className="sett-grid">
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
                )}
              </div>
            </main>
          </>
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
                    {timeSlots.map(t => {
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
                   <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+351 9xx xxx xxx" 
                    className="input-field" 
                  />
                  
                  <div className="voucher-section mt-4" style={{ background: 'rgba(45, 90, 39, 0.05)', padding: '15px', borderRadius: '10px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tem um Voucher de Desconto?</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <input 
                        type="text" 
                        placeholder="Ex: FLASH-XXXX" 
                        className="input-field" 
                        style={{ margin: 0, textTransform: 'uppercase' }}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      />
                      <button className="btn-secondary" style={{ padding: '0 15px' }} onClick={validateVoucher}>Validar</button>
                    </div>
                    {discountPercent > 0 && (
                      <p style={{ color: '#2d5a27', fontSize: '0.8rem', marginTop: '5px', fontWeight: 700 }}>
                        <CheckCircle2 size={14} style={{ verticalAlign: 'middle' }} /> {discountPercent}% de desconto aplicado!
                      </p>
                   )}
                  </div>
                </div>
                <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Valor Total</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, 
                        textDecoration: discountPercent > 0 ? 'line-through' : 'none', 
                        opacity: discountPercent > 0 ? 0.3 : 1 }}>
                        {selectedService?.price}
                      </p>
                      {discountPercent > 0 && (
                        <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#2d5a27' }}>
                          {(parseFloat(selectedService.price) * (1 - discountPercent/100)).toFixed(2)}€
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '12px 30px' }}
                    disabled={isSubmitting || !formData.name || !formData.email} 
                    onClick={handleBookingSubmit}
                  >
                    {isSubmitting ? 'A processar...' : 'Confirmar Reserva'}
                  </button>
                </div>
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

      {/* Toast Portal */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={24} color="#10b981" />}
            {t.type === 'error' && <AlertTriangle size={24} color="#ef4444" />}
            {t.type === 'info' && <Info size={24} color="#3b82f6" />}
            <div className="toast-content">
              <span className="toast-title">{t.title}</span>
              <p className="toast-message">{t.message}</p>
            </div>
            <X size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
