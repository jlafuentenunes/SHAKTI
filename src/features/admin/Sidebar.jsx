import React from 'react';
import { 
  LayoutDashboard, Calendar, Zap, Users, Package, 
  BarChart2, Settings, RefreshCcw, LogOut 
} from 'lucide-react';

const Sidebar = ({ adminTab, setAdminTab, userRole, fetchAppointments, handleLogout }) => {
  return (
    <aside className="admin-sidebar glass-effect">
      <div className="sidebar-logo">SHAKTI<span>HOME</span></div>
      <nav className="side-nav">
        <button className={`side-btn ${adminTab === 'table' ? 'active' : ''}`} onClick={() => setAdminTab('table')}>
          <LayoutDashboard size={20} /> <span>Marcações</span>
        </button>
        <button className={`side-btn ${adminTab === 'calendar' ? 'active' : ''}`} onClick={() => setAdminTab('calendar')}>
          <Calendar size={20} /> <span>Agenda</span>
        </button>
        <button className={`side-btn ${adminTab === 'mirror' ? 'active' : ''}`} onClick={() => setAdminTab('mirror')}>
          <Zap size={20} /> <span>Estúdio AI</span>
        </button>
        {userRole === 'admin' && (
          <>
            <button className={`side-btn ${adminTab === 'technicians' ? 'active' : ''}`} onClick={() => setAdminTab('technicians')}>
              <Users size={20} /> <span>Técnicos</span>
            </button>
            <button className={`side-btn ${adminTab === 'services' ? 'active' : ''}`} onClick={() => setAdminTab('services')}>
              <Package size={20} /> <span>Serviços</span>
            </button>
            <button className={`side-btn ${adminTab === 'customers' ? 'active' : ''}`} onClick={() => setAdminTab('customers')}>
              <Users size={20} /> <span>Clientes</span>
            </button>
            <button className={`side-btn ${adminTab === 'reports' ? 'active' : ''}`} onClick={() => setAdminTab('reports')}>
              <BarChart2 size={20} /> <span>Relatórios</span>
            </button>
            <button className={`side-btn ${adminTab === 'settings' ? 'active' : ''}`} onClick={() => setAdminTab('settings')}>
              <Settings size={20} /> <span>Definições</span>
            </button>
          </>
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
  );
};

export default Sidebar;
