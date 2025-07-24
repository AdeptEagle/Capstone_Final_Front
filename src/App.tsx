import React, { useState, useEffect } from 'react';
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
import './App.css';

// --- MainLayout Component (Updated with Photo Upload Logic) ---
const MainLayout: React.FC<{ onLogout: () => void; children: React.ReactNode }> = ({ onLogout, children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // State for the admin's name and photo URL
  const [adminName, setAdminName] = useState('ADMIN'); // Default name
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | null>(null);

  // This hook can fetch user data when the component loads
  useEffect(() => {
    // Example: Fetch the admin's profile from your server
    // fetch('/api/admin/profile')
    //   .then(res => res.json())
    //   .then(data => {
    //     setAdminName(data.name);
    //     setAdminPhotoUrl(data.photoUrl);
    //   })
    //   .catch(err => console.error("Failed to fetch admin profile", err));
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  /**
   * Handles the complete photo upload process:
   * 1. Creates a temporary preview of the image.
   * 2. Sends the file to the server.
   * 3. Updates the photo URL with the permanent one from the server.
   */
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profileImage', file);

    // Show temporary preview
    const previewUrl = URL.createObjectURL(file);
    setAdminPhotoUrl(previewUrl);

    try {
      // **IMPORTANT**: Replace with your actual API endpoint
      const response = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        body: formData,
        // headers: { 'Authorization': `Bearer YOUR_TOKEN` } // Add auth if needed
      });

      if (!response.ok) {
        throw new Error('Server error during photo upload.');
      }

      const result = await response.json();

      // Update state with the permanent URL from the server
      setAdminPhotoUrl(result.photoUrl);
      alert('Photo updated successfully!');

    } catch (error) {
      console.error('Error uploading photo:', error);
      // Optionally, revert to the old photo if the upload fails
    }
  };

  return (
    <div className="App">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        onLogout={onLogout}
        adminName={adminName}
        adminPhotoUrl={adminPhotoUrl}
        onPhotoChange={handlePhotoChange} // Pass the handler function
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// --- Main App Component (Routing Logic - Unchanged) ---
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/positions" element={<PositionsPage />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/voters" element={<VotersPage />} />
                  <Route path="/results" element={<ResultPage />} />
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