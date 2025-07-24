import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {
  FaUserTie, FaUsers, FaChartBar, FaHome, FaSignOutAlt, FaUserCircle, FaCamera
} from 'react-icons/fa';
import './Sidebar.css';

// The props interface is updated to include the admin's name
interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  onLogout: () => void;
  adminName: string; // <-- You'll need to pass this name
  adminPhotoUrl: string | null;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Your navigation items remain unchanged as requested
const navItems = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/positions', label: 'Positions', icon: <FaUserTie /> },
  { to: '/candidates', label: 'Candidates', icon: <FaUsers /> },
  { to: '/voters', label: 'Voters', icon: <FaUsers /> },
  { to: '/results', label: 'Results', icon: <FaChartBar /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar, onLogout, adminName, adminPhotoUrl, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoutClick = () => {
    closeSidebar();
    onLogout();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      ></div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* The header is updated to stack and center the profile info */}
        <div className="sidebar-header">
          <div className="admin-profile" onClick={handlePhotoClick} title="Change Photo">
            {adminPhotoUrl ? (
              <img src={adminPhotoUrl} alt="Admin" className="admin-photo" />
            ) : (
              <FaUserCircle className="admin-default-icon" />
            )}
            <div className="edit-overlay">
              <FaCamera />
            </div>
          </div>
          <h4 className="admin-name">{adminName}</h4>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onPhotoChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>

        {/* The navigation menu is not changed */}
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className="nav-link"
                end={item.to === '/'}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <Button variant="danger" className="logout-button" onClick={handleLogoutClick}>
            <FaSignOutAlt />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;