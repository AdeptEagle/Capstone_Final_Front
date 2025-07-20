import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  platform: string;
  photo?: string; // Optional photo property
}

const STORAGE_CANDIDATES = 'voting-candidates';
const STORAGE_POSITIONS = 'voting-positions';

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    platform: '',
    photo: '',
  });
  const [validated, setValidated] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platformContent, setPlatformContent] = useState('');

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem(STORAGE_CANDIDATES) || '[]');
    const storedPositions = JSON.parse(localStorage.getItem(STORAGE_POSITIONS) || '[]');
    setCandidates(storedCandidates);
    setPositions(storedPositions.map((p: any) => p.name));
  }, []); // Empty dependency array means this runs once on mount

  const saveCandidates = (newCandidates: Candidate[]) => {
    localStorage.setItem(STORAGE_CANDIDATES, JSON.stringify(newCandidates));
    setCandidates(newCandidates);
  };

  const handleAdd = () => {
    setFormData({ firstName: '', lastName: '', position: '', platform: '', photo: '' });
    setEditId(null); // Clear any edit ID
    setValidated(false); // Reset validation state
    setShowModal(true); // Show the add/edit modal
  };

  const handleEdit = (id: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (candidate) {
      setFormData(candidate); // Populate form with existing candidate data
      setEditId(id); // Set edit ID for update operation
      setValidated(false); // Reset validation state
      setShowModal(true); // Show the add/edit modal
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      const updated = candidates.filter((c) => c.id !== id);
      saveCandidates(updated); // Save updated list
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event propagation for form validation

    // Basic form validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.position  ||
      !formData.platform.trim()
    ) {
      setValidated(true); // Show validation feedback
      return;
    }

    // Create a new candidate object
    const newCandidate: Candidate = {
      id: editId || crypto.randomUUID(), // Use existing ID for edit, new UUID for add
      ...formData,
    };

    // Update candidates array based on whether it's an edit or add operation
    const updated = editId
      ? candidates.map((c) => (c.id === editId ? newCandidate : c))
      : [...candidates, newCandidate];

    saveCandidates(updated); // Save changes
    setShowModal(false); // Close the modal
  };

  const handleViewPlatform = (platform: string) => {
    setPlatformContent(platform); // Set platform content for display
    setShowPlatformModal(true); // Show the platform detail modal
  };

  // 9. Render Logic (JSX)
  return (
    // The key here is that 'bg-light' is applied to the Container,
    // and the global CSS below will ensure html/body stretch to match it.
    <Container fluid className="p-4 bg-light min-vh-100">
      <Row>
        <Col>
          <h2 className="text-dark mb-3 fw-bold">Candidates List</h2>
          <Button variant="info" className="mb-3" onClick={handleAdd}>
            Add New
          </Button>
          <Table bordered hover responsive className="bg-white rounded">
            <thead className="table-info">
              <tr>
                <th>Position</th>
                <th>Photo</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Platform</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-3">
                    No candidates added yet.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.position}</td>
                    <td>
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt="Candidate"
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <span className="text-muted">No Photo</span>
                      )}
                    </td>
                    <td>{candidate.firstName}</td>
                    <td>{candidate.lastName}</td>
                    <td>
                      <Button variant="info" size="sm" onClick={() => handleViewPlatform(candidate.platform)}>
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(candidate.id)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(candidate.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add/Edit Candidate Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Candidate' : 'Add Candidate'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="position">
              <Form.Label>Position</Form.Label>
              <Form.Select
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="" disabled>Select a position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="platform">
              <Form.Label>Platform</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              />
            </Form.Group>

            {/* Photo Upload Field */}
            <Form.Group className="mb-3" controlId="photoUpload">
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, photo: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Platform View Modal */}
      <Modal show={showPlatformModal} onHide={() => setShowPlatformModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Candidate Platform</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{platformContent}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlatformModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// 10. Export Component
export default CandidatesPage;