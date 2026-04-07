import React from 'react';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, Zap } from 'lucide-react';

const CalendarTab = ({ 
  calendarDate, setCalendarDate, userRole, technicians, 
  selectedCalendarTechId, setSelectedCalendarTechId, appointments, 
  timeSlots, blockouts, handleBlockSlot, handlePromoteEmpty 
}) => {
  return (
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

      <div className="timeline-grid-v2 mt-6">
        {timeSlots.map(time => {
          const booking = appointments.find(a => a.booking_date === calendarDate && (a.booking_time === time || a.booking_time === time + ':00') && (!selectedCalendarTechId || a.technician_id == selectedCalendarTechId));
          const isBlocked = blockouts.find(b => b.date === calendarDate && b.time === time && (!selectedCalendarTechId || b.technician_id == selectedCalendarTechId));
          
          return (
            <div key={time} className={`timeline-row-mod ${booking ? 'booked' : isBlocked ? 'blocked' : ''}`}>
              <div className="row-time">
                <Clock size={14} /> {time}
              </div>
              <div className="row-content">
                {booking ? (
                  <div className="booked-chip">
                    <strong>{booking.customer_name}</strong> - {booking.service_name}
                  </div>
                ) : isBlocked ? (
                  <div className="blocked-chip">
                    <AlertTriangle size={14} /> Bloqueado: {isBlocked.reason}
                  </div>
                ) : (
                  <div className="empty-content">
                    <button className="btn-block-v2" onClick={() => handleBlockSlot(selectedCalendarTechId, calendarDate, time)}>Bloquear</button>
                    <button className="btn-promote-v2" onClick={() => handlePromoteEmpty(calendarDate, time)}><Zap size={14} /> Promote</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTab;
