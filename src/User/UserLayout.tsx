import React, { useState } from 'react';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';

/**
 * UserLayout component
 * This component wraps all the user pages, providing the user sidebar and header.
 * This ensures a consistent layout for all authenticated user views.
 */
interface UserLayoutProps {
  onLogout: () => void;
  children: React.ReactNode;
  currentUser?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ onLogout, children, currentUser }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="App">
      <div
        className={`overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      ></div>
      <UserHeader toggleSidebar={toggleSidebar} currentUser={currentUser} />
      <UserSidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} onLogout={onLogout} />
      <main className={isSidebarOpen ? 'content-shifted' : ''}>
        {children}
      </main>
    </div>
  );
};

export default UserLayout;