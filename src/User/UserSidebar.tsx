// UserSidebar.tsx
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {
  FaHome, FaVoteYea, FaChartBar, FaSignOutAlt, FaUser, FaUsers
} from 'react-icons/fa';
import '../Sidebar.css';

/**
 * Interface for UserSidebar component props.
 * @param isOpen - Whether the sidebar is currently open.
 * @param closeSidebar - Function to close the sidebar.
 * @param onLogout - Function to handle user logout.
 */
interface UserSidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  onLogout: () => void;
}

// Array of navigation items for user interface
const userNavItems = [
  { to: '/user', label: 'Home', icon: <FaHome /> },
  { to: '/user/candidates', label: 'Candidates', icon: <FaUsers /> },
  { to: '/user/vote', label: 'Vote', icon: <FaVoteYea /> },
  { to: '/user/results', label: 'Results', icon: <FaChartBar /> },
];

/**
 * A user-friendly sidebar for student navigation.
 */
const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen, closeSidebar, onLogout }) => {
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
          <FaUser size="24" />
          <h3 className="sidebar-title">Student</h3>
        </div>

        <ul className="sidebar-nav">
          {userNavItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className="nav-link"
                // The 'end' prop is only needed for the root path
                end={item.to === '/user'}
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

export default UserSidebar;