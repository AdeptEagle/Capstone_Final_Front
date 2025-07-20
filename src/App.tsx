// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import CandidatesPage from './CandidatePage';
import VotersPage from './VotersPage';
import PositionsPage from './PositionsPage';
import ResultPage from './ResultPage';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminLoginPage from './AdminLoginPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

/**
 * MainLayout component
 * This component wraps all the main pages, providing the sidebar and header.
 * This ensures a consistent layout for all authenticated views.
 */
const MainLayout: React.FC<{ onLogout: () => void; children: React.ReactNode }> = ({ onLogout, children }) => {
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
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} onLogout={onLogout} />
      <main className={isSidebarOpen ? 'content-shifted' : ''}>
        {children}
      </main>
    </div>
  );
};


/**
 * Main App component
 * Handles routing and the distinction between public (login) and private (main app) routes.
 */
const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const handleAdminLogin = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={
            isAdminLoggedIn ? <Navigate to="/" /> : <AdminLoginPage onLogin={handleAdminLogin} />
          } 
        />

        {/* Protected Application Routes */}
        <Route
          path="/*"
          element={
            isAdminLoggedIn ? (
              <MainLayout onLogout={handleAdminLogout}>
                <Routes>
                  {/* All pages inside MainLayout will have the sidebar */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/positions" element={<PositionsPage />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/voters" element={<VotersPage />} />
                  <Route path="/results" element={<ResultPage />} />
                  
                  {/* Redirect any other invalid path to the homepage */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
