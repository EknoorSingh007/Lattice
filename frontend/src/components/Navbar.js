import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { user, dispatch } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) {
      fetchUserProfile();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = data.filter(r => r.receiver._id === user._id && r.status === 'pending');
        setPendingRequestsCount(pending.length);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    navigate('/landing');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/discover', label: 'Discover' },
    { to: '/chat', label: 'Community' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/aboutus', label: 'About' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: 'var(--navbar-height)',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/favicon.svg" alt="Lattice" style={{ width: 36, height: 36 }} />
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            Lattice
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div className="nav-links-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive(link.to)
                    ? '#667eea'
                    : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                  backgroundColor: isActive(link.to)
                    ? (theme === 'dark' ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)')
                    : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {link.label}
                  {link.label === 'Community' && pendingRequestsCount > 0 && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                    }}>
                      {pendingRequestsCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{
              background: 'none',
              border: `1px solid ${theme === 'dark' ? '#475569' : '#e2e8f0'}`,
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme === 'dark' ? '#fbbf24' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {/* Profile */}
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                  border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {userProfile?.profilePhoto ? (
                  <img
                    src={userProfile.profilePhoto}
                    alt="Profile"
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {userProfile?.firstName?.charAt(0) || <User size={14} />}
                  </div>
                )}
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: theme === 'dark' ? '#e2e8f0' : '#334155',
                }} className="nav-profile-name">
                  {userProfile?.firstName || 'Profile'}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: `1px solid ${theme === 'dark' ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme === 'dark' ? '#94a3b8' : '#64748b',
                  transition: 'all 0.2s ease',
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                borderRadius: '0.5rem',
                transition: 'color 0.2s ease',
              }}>
                Login
              </Link>
              <Link to="/signup" style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: '#fff',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '9999px',
                transition: 'all 0.2s ease',
              }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#e2e8f0' : '#334155',
              padding: '0.5rem',
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 49,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          {user && navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive(link.to)
                  ? '#667eea'
                  : (theme === 'dark' ? '#e2e8f0' : '#334155'),
                backgroundColor: isActive(link.to)
                  ? (theme === 'dark' ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)')
                  : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{
                padding: '1rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 600,
                textDecoration: 'none', color: theme === 'dark' ? '#e2e8f0' : '#334155',
              }}>Login</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} style={{
                padding: '1rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 600,
                textDecoration: 'none', color: '#fff', textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
          .nav-profile-name { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;