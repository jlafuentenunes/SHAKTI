import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ title, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={24} color="#10b981" />;
      case 'error': return <AlertTriangle size={24} color="#ef4444" />;
      case 'info': return <Info size={24} color="#3b82f6" />;
      default: return null;
    }
  };

  return (
    <div className={`toast ${type}`}>
      {getIcon()}
      <div className="toast-content">
        <span className="toast-title">{title}</span>
        <p className="toast-message">{message}</p>
      </div>
      <X size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={onClose} />
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast 
          key={t.id} 
          {...t} 
          onClose={() => onRemove(t.id)} 
        />
      ))}
    </div>
  );
};

export default Toast;
