import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineBell } from 'react-icons/hi';
import './TopBar.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/add': 'Add Transaction',
  '/analytics': 'Analytics',
  '/assistant': 'AI Assistant',
  '/settings': 'Settings',
};

const TopBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SpendLens';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <div>
          <h2 className="topbar-title">{title}</h2>
          {location.pathname === '/dashboard' && (
            <p className="topbar-greeting">{greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</p>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="search-input"
            id="global-search"
          />
        </div>

        <button className="btn-icon topbar-icon" id="notification-btn">
          <HiOutlineBell />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
