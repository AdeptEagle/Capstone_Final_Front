import React from 'react';
import '../Header.css';

interface UserHeaderProps {
  toggleSidebar: () => void;
  currentUser?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ toggleSidebar, currentUser }) => {
  return (
    <header className="app-header">
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        &#9776;
      </button>
      <div className="app-header-title">
        Student Election Portal
      </div>
      {currentUser && (
        <div className="ms-auto text-white">
          Welcome, {currentUser}
        </div>
      )}
    </header>
  );
};

export default UserHeader;