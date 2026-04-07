import React from 'react';
import { X, Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft, CreditCard } from 'lucide-react';

const BookingModal = ({ 
  isOpen, onClose, services, technicians, timeSlots, 
  bookingForm, setBookingForm, bookingStep, setBookingStep, 
  handleBookingSubmit, isSubmitting 
}) => {
  if (!isOpen) return null;

  const nextStep = () => setBookingStep(prev => prev + 1);
  const prevStep = () => setBookingStep(prev => prev - 1);

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in glass-effect booking-modal-v3">
        <header className="modal-header">
          <div className="step-indicator">
            <div className={`step ${bookingStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${bookingStep >= 2 ? 'active' : ''}`}>2</div>
            <div className="step-line"></div>
            <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <button className="close-btn" onClick={onClose}><X /></button>
        </header>

        <div className="modal-body">
          {bookingStep === 1 && (
            <div className="step-content">
              <h2>O que deseja realizar?</h2>
              <div className="booking-services-grid">
                {services.filter(s => s.deleted_at === null).map(s => (
                  <button 
                    key={s.id} 
                    className={`booking-service-card ${bookingForm.service_id === s.id ? 'selected' : ''}`}
                    onClick={() => { setBookingForm({...bookingForm, service_id: s.id, service_name: s.name, price: s.price}); nextStep(); }}
                  >
                    <div className="s-info">
                      <strong>{s.name}</strong>
                      <span>{s.duration} • {s.price}</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="step-content">
              <h2>Quando prefere agendar?</h2>
              <div className="grid-split">
                <div className="date-picker-area">
                  <label><Calendar size={16}/> Selecione o Dia</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]} 
                    value={bookingForm.date} 
                    onChange={e => setBookingForm({...bookingForm, date: e.target.value})}
                    className="glass-input"
                  />
                </div>
                <div className="time-picker-area">
                  <label><Clock size={16}/> Horários Disponíveis</label>
                  <div className="time-grid-v3">
                    {timeSlots.map(t => (
                      <button 
                        key={t} 
                        className={`time-chip ${bookingForm.time === t ? 'selected' : ''}`}
                        onClick={() => setBookingForm({...bookingForm, time: t})}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="step-footer">
                <button className="btn-secondary" onClick={prevStep}><ChevronLeft size={18}/> Voltar</button>
                <button className="btn-primary" disabled={!bookingForm.date || !bookingForm.time} onClick={nextStep}>Próximo Passo <ChevronRight size={18}/></button>
              </footer>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="step-content">
              <h2>Confirme os seus dados</h2>
              <div className="summary-card glass-effect mb-6">
                 <p><strong>Serviço:</strong> {bookingForm.service_name}</p>
                 <p><strong>Data:</strong> {bookingForm.date} às {bookingForm.time}</p>
                 <p><strong>Valor:</strong> {bookingForm.price}</p>
              </div>
              <form className="modern-form" onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label><User size={16}/> Nome Completo</label>
                  <input value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} className="glass-input" required />
                </div>
                <div className="grid-split">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} className="glass-input" required />
                  </div>
                  <div className="form-group">
                    <label>Telemóvel</label>
                    <input type="tel" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} className="glass-input" required />
                  </div>
                </div>
                <div className="payment-method-v3 mt-4">
                   <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}><CreditCard size={14} /> Método de Pagamento</p>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <label className="pay-pill">
                        <input type="radio" name="pay" checked />
                        <span>Pagamento no Local</span>
                      </label>
                   </div>
                </div>
                <footer className="step-footer mt-10">
                  <button type="button" className="btn-secondary" onClick={prevStep}><ChevronLeft size={18}/> Voltar</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'A processar...' : 'Confirmar Reserva'} <CheckCircle2 size={18}/>
                  </button>
                </footer>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
