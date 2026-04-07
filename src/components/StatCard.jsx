import React from 'react';

const StatCard = ({ title, value, icon, iconBg, iconColor, onClick }) => {
  return (
    <div className="stat-card glass-effect" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-info">
        <small>{title}</small>
        <h3>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
