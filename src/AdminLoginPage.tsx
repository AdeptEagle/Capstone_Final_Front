import { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import './AdminLoginPage.css'; // Import the new CSS file

interface AdminLoginPageProps {
  onLogin: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setError('');
      onLogin();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="text-center mb-4 fw-bold">Admin</h2>
        <Form onSubmit={handleLogin}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="username">
            <InputGroup>
              <InputGroup.Text>
                <FaUser />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <InputGroup>
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 login-button">
            Login
          </Button>
        </Form>
        <div className="text-center mt-3">
          <small className="text-light">Use admin / password to login</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;