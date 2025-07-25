import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock, FaUserPlus, FaIdCard } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import '../AdminLoginPage.css'; // Reuse the same styling

interface UnifiedLoginPageProps {
  onAdminLogin: () => void;
  onUserLogin: (schoolId: string) => void;
}

interface Voter {
  id: string;
  name: string;
  schoolId: string;
  password?: string; // New field for user passwords
  photo?: string;
}

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({ onAdminLogin, onUserLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError('');
    setSuccess('');
  };

  const switchMode = (registering: boolean) => {
    setIsRegistering(registering);
    clearForm();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if username is 'admin'
    if (username.toLowerCase() === 'admin') {
      if (password !== 'password') {
        setError('Invalid admin password.');
        return;
      }
      onAdminLogin();
      return;
    }

    // Check if username is a valid student ID
    const voters: Voter[] = JSON.parse(localStorage.getItem('voting-voters') || '[]');
    const found = voters.find((v: Voter) => v.schoolId === username.trim());

    if (found) {
      // Check password - use custom password if set, otherwise default 'password'
      const expectedPassword = found.password || 'password';
      if (password !== expectedPassword) {
        setError('Invalid password.');
        return;
      }

      localStorage.setItem('currentUserSchoolId', found.schoolId);
      onUserLogin(found.schoolId);
      return;
    }

    setError('Invalid username. Use "admin" for admin access or your Student ID for student access.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your Student ID.');
      return;
    }

    if (username.toLowerCase() === 'admin') {
      setError('Cannot register with admin username.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check if student ID already exists
    const voters: Voter[] = JSON.parse(localStorage.getItem('voting-voters') || '[]');
    const existingVoter = voters.find((v: Voter) => v.schoolId === username.trim());

    if (existingVoter) {
      setError('A user with this Student ID already exists.');
      return;
    }

    // Create new voter
    const newVoter: Voter = {
      id: uuidv4(),
      name: fullName.trim(),
      schoolId: username.trim(),
      password: password,
      photo: ''
    };

    // Add to voters list
    const updatedVoters = [...voters, newVoter];
    localStorage.setItem('voting-voters', JSON.stringify(updatedVoters));

    setSuccess('Account created successfully! You can now log in.');

    // Reset form and switch to login mode after a short delay
    setTimeout(() => {
      switchMode(false);
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="text-center mb-4 fw-bold">Student Election Portal</h2>
        <p className="text-center text-light mb-4">
          {isRegistering ? 'Create your account to participate' : 'Enter your credentials to access the system'}
        </p>

        {/* Toggle Buttons */}
        <div className="d-flex mb-4">
          <Button
            variant={!isRegistering ? "primary" : "outline-light"}
            className="flex-fill me-2"
            onClick={() => switchMode(false)}
          >
            <FaUser className="me-2" />
            Login
          </Button>
          <Button
            variant={isRegistering ? "primary" : "outline-light"}
            className="flex-fill"
            onClick={() => switchMode(true)}
          >
            <FaUserPlus className="me-2" />
            Register
          </Button>
        </div>

        <Form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Registration-only field: Full Name */}
          {isRegistering && (
            <Form.Group className="mb-3" controlId="fullName">
              <InputGroup>
                <InputGroup.Text>
                  <FaIdCard />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="username">
            <InputGroup>
              <InputGroup.Text>
                <FaUser />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={isRegistering ? "Student ID" : "Username (admin or Student ID)"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <InputGroup>
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder={isRegistering ? "Create Password (min 6 characters)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isRegistering ? 6 : undefined}
              />
            </InputGroup>
          </Form.Group>

          {/* Registration-only field: Confirm Password */}
          {isRegistering && (
            <Form.Group className="mb-4" controlId="confirmPassword">
              <InputGroup>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
          )}

          <Button variant="primary" type="submit" className="w-100 login-button">
            {isRegistering ? 'Create Account' : 'Login'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <small className="text-light">
            {isRegistering ? (
              <>
                <strong>Registration:</strong> Use your Student ID and create a secure password<br />
                <strong>Note:</strong> Your account will be added to the voter list automatically
              </>
            ) : (
              <>
                <strong>Admin:</strong> Use username "admin" with password "password"<br />
                <strong>Students:</strong> Use your Student ID with your password<br />
                <strong>New users:</strong> Click Register to create an account
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
