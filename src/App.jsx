import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, MapPin, Phone, Clock, User, ChevronRight, ChevronLeft,
  CheckCircle2, Menu, X, Mail, LayoutDashboard, Users, Settings,
  LogOut, RefreshCcw, DollarSign, TrendingUp, Info, AlertTriangle,
  CheckSquare, Package, Zap, Camera, BarChart2
} from 'lucide-react';

// Services & Components
import { api } from './services/api';
import { useMirror } from './features/mirror/MirrorContext';
import Sidebar from './features/admin/Sidebar';
import AdminHeader from './features/admin/AdminHeader';
import StatCard from './components/StatCard';
import { ToastContainer } from './components/Toast';
import AIMirrorModal from './features/mirror/AIMirrorModal';
import MirrorStudio from './features/mirror/MirrorStudio';

// Admin Tabs
import AppointmentsTab from './features/admin/tabs/AppointmentsTab';
import CalendarTab from './features/admin/tabs/CalendarTab';
import ServicesTab from './features/admin/tabs/ServicesTab';
import TechniciansTab from './features/admin/tabs/TechniciansTab';
import ReportsTab from './features/admin/tabs/ReportsTab';
import BookingModal from './features/booking/BookingModal';

import Hero from './components/sections/Hero';
import ServicesPage from './components/sections/Services';
import About from './components/sections/About';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';
import './App.css';

// services will be loaded from DB

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    service_id: null,
    service_name: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    name: '',
    email: '',
    phone: '',
    promoCode: '',
    discount: 0
  });

  const [view, setView] = useState('client'); // 'client' or 'admin'
  const { setIsMirrorOpen, mirrorStage, setMirrorStage } = useMirror();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('shakti-token'));
  const [loginForm, setLoginForm] = useState({ user: '', password: '' });
  const [adminTab, setAdminTab] = useState('table');
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [userRole, setUserRole] = useState(localStorage.getItem('shakti-role') || 'client');
  const [userTechId, setUserTechId] = useState(localStorage.getItem('shakti-tech-id'));
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showDeletedServices, setShowDeletedServices] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [blockouts, setBlockouts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [settings, setSettings] = useState({ calendar_start: '09:00', calendar_end: '19:00', slot_duration: 90 });
  const [analytics, setAnalytics] = useState({ revenue: 0, trends: [], services: [], customers: { total_customers: 0, active_customers: 0 }, technicians: [] });
  const [selectedCalendarTechId, setSelectedCalendarTechId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

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


  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (error) { console.error('Analytics error:', error); }
  };

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
    if (!bookingForm.promoCode) return;
    try {
      const data = await api.validateVoucher(bookingForm.promoCode, bookingForm.service_id);
      if (data.success) {
        setBookingForm(prev => ({ ...prev, discount: data.discount }));
        notify('Voucher Aplicado!', `${data.discount}% de desconto aplicado.`);
      } else {
        notify('Inválido', data.message, 'error');
        setBookingForm(prev => ({ ...prev, discount: 0 }));
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
      const data = await api.getAppointments();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await api.getTechnicians();
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
    fetchTechnicians();
    fetchAnalytics();
  }, [calendarDate, adminTab]);

  useEffect(() => {
    if (isLoggedIn && userRole === 'admin') {
      fetchAnalytics();
    }
  }, [isLoggedIn, appointments]);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (Array.isArray(data)) setVouchers(data);
    } catch (e) { console.error("Vouchers err:", e); }
  };

  const createManualVoucher = async (vData) => {
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
        body: JSON.stringify(vData)
      });
      if ((await res.json()).success) { notify('Sucesso', 'Voucher criado!'); fetchVouchers(); }
    } catch (e) { notify('Erro', 'Falha ao criar voucher.', 'error'); }
  };

  const deleteVoucher = async (id) => {
    try {
      const res = await fetch(`/api/vouchers/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'fake-jwt-shakti-admin' } 
      });
      if ((await res.json()).success) { notify('Removido', 'Voucher apagado.'); fetchVouchers(); }
    } catch (e) { notify('Erro', 'Não foi possível apagar.', 'error'); }
  };


  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${customerSearch}`);
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (e) { console.error("Customers err:", e); }
  };

  useEffect(() => {
    if (adminTab === 'customers') fetchCustomers();
  }, [adminTab, customerSearch]);

  const updateCustomer = async (id, data) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'fake-jwt-shakti-admin' },
        body: JSON.stringify(data)
      });
      if ((await res.json()).success) { notify('Atualizado', 'Ficha guardada.'); fetchCustomers(); }
    } catch (e) { notify('Erro', 'Erro ao guardar.', 'error'); }
  };

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
      const data = await api.login(loginForm);
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openBooking = (service = null) => {
    if (service) {
      setBookingForm(prev => ({ 
        ...prev, 
        service_id: service.id, 
        service_name: service.name, 
        price: service.price 
      }));
      setBookingStep(2);
    } else {
      setBookingStep(1);
    }
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          voucherCode: bookingForm.promoCode
        })
      });
      
      const data = await response.json();
      if (data.success) {
        notify('Reserva Efetuada', 'Receberá um contacto em breve para confirmação.');
        setIsBookingOpen(false);
        setBookingStep(1);
        setBookingForm({
          service_id: null, service_name: '', price: '',
          date: new Date().toISOString().split('T')[0], time: '',
          name: '', email: '', phone: '', promoCode: '', discount: 0
        });
      } else {
        notify('Agendamento Negado', data.message || 'Horário indisponível.', 'error');
      }
    } catch (error) {
      notify('Agendamento Negado', 'Erro técnico na reserva.', 'error');
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
  return (
    <div className="shakti-app">
      {view === 'admin' ? (
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
            <Sidebar 
              adminTab={adminTab} setAdminTab={setAdminTab} 
              userRole={userRole} fetchAppointments={fetchAppointments} 
              handleLogout={handleLogout} 
            />

            <main className="admin-main">
              <AdminHeader 
                adminTab={adminTab} userRole={userRole} 
                technicians={technicians} userTechId={userTechId} 
              />

              <div className="admin-content-area">
                {adminTab === 'table' && (
                  <AppointmentsTab 
                    appointments={appointments} technicians={technicians} 
                    services={services} analytics={analytics} 
                    updateBookingStatus={updateBookingStatus} handlePromote={handlePromote} 
                    notify={notify} 
                  />
                )}

                {adminTab === 'calendar' && (
                  <CalendarTab 
                    calendarDate={calendarDate} setCalendarDate={setCalendarDate} 
                    userRole={userRole} technicians={technicians} 
                    selectedCalendarTechId={selectedCalendarTechId} 
                    setSelectedCalendarTechId={setSelectedCalendarTechId} 
                    appointments={appointments} timeSlots={timeSlots} 
                    blockouts={blockouts} handleBlockSlot={handleBlockSlot} 
                    handlePromoteEmpty={handlePromoteEmpty} 
                  />
                )}

                {adminTab === 'technicians' && (
                  <TechniciansTab 
                    technicians={technicians} appointments={appointments} 
                    services={services} updateHourlyRate={updateHourlyRate} 
                    fetchTechnicians={fetchTechnicians} 
                  />
                )}

                {adminTab === 'services' && (
                  <ServicesTab 
                    services={services} technicians={technicians} 
                    serviceSearch={serviceSearch} setServiceSearch={setServiceSearch} 
                    showDeletedServices={showDeletedServices} 
                    setShowDeletedServices={setShowDeletedServices} 
                    createService={createService} softDeleteService={softDeleteService} 
                    restoreService={restoreService} hardDeleteService={hardDeleteService} 
                    vouchers={vouchers} deleteVoucher={deleteVoucher} 
                    createManualVoucher={createManualVoucher} notify={notify} 
                    fetchServicesFromDB={fetchServicesFromDB} 
                  />
                )}

                {adminTab === 'customers' && (
                  <CustomersTab 
                    customers={customers} customerSearch={customerSearch} 
                    setCustomerSearch={setCustomerSearch} appointments={appointments} 
                    updateCustomer={updateCustomer} 
                  />
                )}

                {adminTab === 'reports' && (
                  <ReportsTab 
                    analytics={analytics} fetchAnalytics={fetchAnalytics} 
                  />
                )}

                {adminTab === 'settings' && (
                  <SettingsTab 
                    settings={settings} updateSettings={updateSettings} 
                  />
                )}

                {adminTab === 'mirror' && (
                  <div className="admin-mirror-container animate-in" style={{ height: '75vh', maxHeight: '800px', background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
                    <MirrorStudio variant="admin" onBooking={openBooking} />
                  </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    ) : (
      <div className="app">
        <Hero 
          scrolled={scrolled} 
          onBooking={openBooking} 
          onMirror={setIsMirrorOpen} 
        />
        
        <ServicesPage 
          services={services} 
          onBooking={openBooking} 
        />
        
        <About />
        
        <Contact 
          contactForm={contactForm} 
          setContactForm={setContactForm} 
          handleContactSubmit={handleContactSubmit} 
          isSubmitting={isSubmitting} 
        />
        
        <Footer 
          onAdminLogin={() => setView('admin')} 
        />
        
        <AIMirrorModal onBooking={openBooking} />
        <BookingModal 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          services={services} 
          technicians={technicians} 
          timeSlots={timeSlots} 
          bookingForm={bookingForm} 
          setBookingForm={setBookingForm} 
          bookingStep={bookingStep} 
          setBookingStep={setBookingStep} 
          handleBookingSubmit={handleBookingSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    )}
    <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
  </div>
  );
}

export default App;
