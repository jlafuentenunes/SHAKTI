import React from 'react';

const AdminHeader = ({ adminTab, userRole, technicians, userTechId }) => {
  const getPageTitle = () => {
    switch (adminTab) {
      case 'table': return 'Gestão de Reservas';
      case 'calendar': return 'Calendário de Estúdio';
      case 'mirror': return 'Estúdio AI';
      case 'technicians': return 'Gestão de Talentos';
      case 'customers': return 'Histórico de Clientes';
      case 'reports': return 'Performance de Negócio';
      case 'settings': return 'Configurações Globais';
      default: return 'Portal Shakti';
    }
  };

  const currentTech = technicians.find(t => t.id == userTechId);
  const welcomeText = userRole === 'admin' ? 'Administrador' : (currentTech?.name || 'Técnico');

  return (
    <header className="admin-page-header">
      <h1>{getPageTitle()}</h1>
      <p className="subtitle">Bons tratamentos, {welcomeText}.</p>
    </header>
  );
};

export default AdminHeader;
