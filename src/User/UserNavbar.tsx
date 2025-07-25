import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaHome, FaVoteYea, FaChartBar, FaUsers, FaSignOutAlt } from 'react-icons/fa';

interface UserNavbarProps {
  onLogout: () => void;
  currentUser?: string;
}

const UserNavbar: React.FC<UserNavbarProps> = ({ onLogout, currentUser }) => {
  const navItems = [
    { to: '/user', label: 'Home', icon: <FaHome /> },
    { to: '/user/candidates', label: 'Candidates', icon: <FaUsers /> },
    { to: '/user/vote', label: 'Vote', icon: <FaVoteYea /> },
    { to: '/user/results', label: 'Results', icon: <FaChartBar /> },
  ];

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm" style={{ borderBottom: '3px solid #0d6efd' }}>
      <Container>
        <Navbar.Brand as={NavLink} to="/user" className="fw-bold text-primary">
          Student Election
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map((item) => (
              <Nav.Link as={NavLink} to={item.to} key={item.to} className="d-flex align-items-center">
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <Nav>
            {currentUser && <Navbar.Text className="me-3">Welcome, {currentUser}</Navbar.Text>}
            <Button variant="outline-danger" onClick={onLogout}>
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
