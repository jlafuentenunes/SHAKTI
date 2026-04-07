import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = ({ contactForm, setContactForm, handleContactSubmit, isSubmitting }) => {
  return (
    <section id="contact" className="contact-section container pt-24 pb-48 animate">
      <div className="section-header text-center mb-16 px-4">
        <span className="subtitle">Entre em Contacto</span>
        <h2>Para Consultas ou Feedback</h2>
        <div className="accent-line mx-auto"></div>
      </div>
      <div className="contact-grid">
        <div className="contact-info p-12 glass-card rounded-3xl bg-primary text-white shadow-2xl flex flex-col justify-center">
          <div className="info-block mb-10 flex gap-6 items-center border-b border-white/10 pb-10">
            <div className="icon-wrap bg-white/10 p-4 rounded-2xl"><MapPin size={24} /></div>
            <div>
               <h4 className="font-bold text-xl">Morada</h4>
               <p className="opacity-80">Av. da Praia 44, Apúlia, Portugal</p>
            </div>
          </div>
          <div className="info-block mb-10 flex gap-6 items-center border-b border-white/10 pb-10">
            <div className="icon-wrap bg-white/10 p-4 rounded-2xl"><Phone size={24} /></div>
            <div>
               <h4 className="font-bold text-xl">Telemóvel</h4>
               <p className="opacity-80">+351 912 345 678</p>
            </div>
          </div>
          <div className="info-block flex gap-6 items-center">
            <div className="icon-wrap bg-white/10 p-4 rounded-2xl"><Mail size={24} /></div>
            <div>
               <h4 className="font-bold text-xl">E-mail</h4>
               <p className="opacity-80">shaktihome@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap p-12 glass-card rounded-3xl shadow-xl bg-white/50 backdrop-blur-xl">
          <form className="modern-form space-y-6" onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Nome</label>
                <input 
                  type="text" 
                  className="glass-input p-4 rounded-2xl border-none ring-1 ring-gray-100 transition-all focus:ring-2 focus:ring-primary outline-none"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input 
                  type="email" 
                  className="glass-input p-4 rounded-2xl border-none ring-1 ring-gray-100 transition-all focus:ring-2 focus:ring-primary outline-none"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Mensagem</label>
              <textarea 
                className="glass-input p-4 rounded-2xl border-none ring-1 ring-gray-100 min-h-[200px] transition-all focus:ring-2 focus:ring-primary outline-none"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
