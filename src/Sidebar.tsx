// Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {
  FaTachometerAlt, FaUserTie, FaUsers, FaChartBar, FaHome, FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

/**
 * Interface for Sidebar component props.
 * @param isOpen - Whether the sidebar is currently open.
 * @param closeSidebar - Function to close the sidebar.
 * @param onLogout - Function to handle user logout.
 */
interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  onLogout: () => void;
}

// Array of navigation items for easier management
const navItems = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/positions', label: 'Positions', icon: <FaUserTie /> },
  { to: '/candidates', label: 'Candidates', icon: <FaUsers /> },
  { to: '/voters', label: 'Voters', icon: <FaUsers /> },
  { to: '/results', label: 'Results', icon: <FaChartBar /> },
];

/**
 * A professional and user-friendly sidebar for navigation.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar, onLogout }) => {
  const handleLogoutClick = () => {
    closeSidebar();
    onLogout();
  };

  return (
    <>
      {/* Overlay to close sidebar on click */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      ></div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FaTachometerAlt size="24" />
          <h3 className="sidebar-title">Admin</h3>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className="nav-link"
                // The 'end' prop is only needed for the root path
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