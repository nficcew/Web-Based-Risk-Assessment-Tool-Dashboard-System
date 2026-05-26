import {
  AlertTriangle,
  Calculator,
  ChevronDown,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  Users,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [currentUser, setCurrentUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar when navigating on mobile
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'user'] },
    { path: '/assets', icon: Database, label: 'Asset Management', roles: ['admin', 'user'] },
    { path: '/threats', icon: AlertTriangle, label: 'Threats & Vulnerabilities', roles: ['admin', 'user'] },
    { path: '/assessment', icon: Calculator, label: 'Risk Assessment', roles: ['admin', 'user'] },
    { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'user'] },
    { path: '/users', icon: Users, label: 'User Management', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Mobile Overlay - tap to close sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Close button on mobile */}
        {isMobile && (
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}

        <div className="sidebar-header">
          <div className="logo">
            <Shield size={32} />
            {(sidebarOpen || isMobile) && <span>Risk Assessment</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon size={20} />
              {(sidebarOpen || isMobile) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            {(sidebarOpen || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen && !isMobile ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen && !isMobile ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="topbar-title">
            <h1>ISO/IEC 27001:2022 Compliance</h1>
            <p>Cybersecurity Risk Assessment Tool</p>
          </div>

          {/* User Profile Dropdown */}
          <div className="profile-dropdown" ref={dropdownRef}>
            <button
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-info">
                <span className="user-name">{currentUser?.full_name || 'User'}</span>
                <span className="user-role">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>
              <div className="user-avatar">
                <User size={20} />
              </div>
              <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User size={24} />
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{currentUser?.full_name || 'User'}</span>
                    <span className="dropdown-email">{currentUser?.email || ''}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                >
                  <Settings size={16} />
                  <span>Edit Profile</span>
                </button>
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;