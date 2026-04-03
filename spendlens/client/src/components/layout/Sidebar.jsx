import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid, HiOutlineCreditCard, HiOutlinePlusCircle,
  HiOutlineChartBar, HiOutlineChatAlt2, HiOutlineCog,
  HiOutlineLogout, HiOutlineSparkles
} from 'react-icons/hi';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/transactions', label: 'Transactions', icon: HiOutlineCreditCard },
  { path: '/add', label: 'Add New', icon: HiOutlinePlusCircle },
  { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { path: '/assistant', label: 'AI Assistant', icon: HiOutlineChatAlt2 },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar glass" id="main-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <HiOutlineSparkles />
          </div>
          <div className="logo-text">
            <span className="logo-name">SpendLens</span>
            <span className="logo-tag">AI Finance</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Menu</span>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              id={`nav-${item.path.slice(1)}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
              {item.path === '/assistant' && (
                <span className="nav-badge">AI</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button className="btn-ghost nav-item" onClick={logout} id="logout-btn">
          <HiOutlineLogout className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
