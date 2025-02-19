import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="side-nav">
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3h18v18H3zM9 3v18M21 9H3" />
          </svg>
          Tasks
        </Link>
        <Link
          to="/analytics"
          className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Analytics
        </Link>
      </div>
    </nav>
  );
};

export default SideNav;