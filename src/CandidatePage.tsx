import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  course: string; // NEW: Course/College field
  platform: string;
  photo?: string; 
}

const STORAGE_CANDIDATES = 'voting-candidates';
const STORAGE_POSITIONS = 'voting-positions';

const PlaceholderIcon = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="#ced4da">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Candidate>({
    id: '',
    firstName: '',
    lastName: '',
    position: '',
    course: '', // NEW: Initialize course
    platform: '',
    photo: '',
  });
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem(STORAGE_CANDIDATES) || '[]');
    const storedPositions = JSON.parse(localStorage.getItem(STORAGE_POSITIONS) || '[]');
    setCandidates(storedCandidates);
    setPositions(storedPositions.map((p: any) => p.name));
  }, []);

  const saveCandidates = (newCandidates: Candidate[]) => {
    localStorage.setItem(STORAGE_CANDIDATES, JSON.stringify(newCandidates));
    setCandidates(newCandidates);
  };

  const handleAdd = () => {
    // NEW: Reset form data including course
    setFormData({ id: '', firstName: '', lastName: '', position: '', course: '', platform: '', photo: '' });
    setEditId(null);
    setValidated(false);
    setShowModal(true);
  };

  const handleEdit = (candidate: Candidate) => {
    setFormData(candidate);
    setEditId(candidate.id);
    setValidated(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      const updated = candidates.filter((c) => c.id !== id);
      saveCandidates(updated);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const newCandidate: Candidate = {
      ...formData,
      id: editId || crypto.randomUUID(),
    };

    const updated = editId
      ? candidates.map((c) => (c.id === editId ? newCandidate : c))
      : [...candidates, newCandidate];

    saveCandidates(updated);
    setShowModal(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="text-dark fw-bold">Candidates</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleAdd}>
             + Add Candidate 
          </Button>
        </Col>
      </Row>

      <Row>
        {candidates.length === 0 ? (
          <Col>
            <Alert variant="info">No candidates have been added yet. Click 'Add Candidate' to begin.</Alert>
          </Col>
        ) : (
          candidates.map((candidate) => (
            <Col key={candidate.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="text-center shadow-sm h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #eee'
                        }}
                      />
                    ) : (
                      <PlaceholderIcon />
                    )}
                  </div>
                  <Card.Text className="text-primary fw-bold">{candidate.position}</Card.Text>
                  <Card.Title className="fw-bold">{`${candidate.firstName} ${candidate.lastName}`}</Card.Title>

                  {/* NEW: Display the course on the card */}
                  <Card.Subtitle className="mb-2 text-muted">{candidate.course}</Card.Subtitle>

                  <Card.Text
                    className="text-start small text-muted border-top mt-2 pt-2"
                    style={{
                      flexGrow: 1,
                      maxHeight: '80px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {candidate.platform}
                  </Card.Text>
                  
                  <div className="mt-auto pt-3">
                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(candidate)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(candidate.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Add/Edit Candidate Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Candidate' : 'Add New Candidate'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3 text-center">
                {formData.photo ? (
                    <img src={formData.photo} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}/>
                ) : (
                    <div className="p-3 bg-light rounded-circle d-inline-block">
                        <PlaceholderIcon />
                    </div>
                )}
                 <Form.Control type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-2" />
            </Form.Group>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}/>
                        <Form.Control.Feedback type="invalid">Please enter a first name.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}/>
                         <Form.Control.Feedback type="invalid">Please enter a last name.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="position">
              <Form.Label>Position</Form.Label>
              <Form.Select required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                <option value="" disabled>Select a position...</option>
                {positions.map((pos) => (<option key={pos} value={pos}>{pos}</option>))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">Please select a position.</Form.Control.Feedback>
            </Form.Group>

            {/* NEW: Form group for Course/College */}
            <Form.Group className="mb-3" controlId="course">
                <Form.Label>Course / College</Form.Label>
                <Form.Control type="text" required value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}/>
                <Form.Control.Feedback type="invalid">Please enter a course or college.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="platform">
              <Form.Label>Platform</Form.Label>
              <Form.Control as="textarea" rows={3} required value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })}/>
              <Form.Control.Feedback type="invalid">Please enter a platform.</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Candidate</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default CandidatesPage;