import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Image } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITION ---
interface Voter {
  id: string;
  name: string;
  schoolId: string;
  photo?: string;
}

// --- CONSTANTS ---
const STORAGE_KEY = 'voting-voters';

/**
 * VotersPage Component
 * Manages the CRUD and search operations for voters.
 */
const VotersPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [voters, setVoters] = useState<Voter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Voter, 'id'>>({ name: '', schoolId: '', photo: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  // New state for the search query
  const [searchQuery, setSearchQuery] = useState('');

  // --- LIFECYCLE HOOK ---
  useEffect(() => {
    const storedVoters = localStorage.getItem(STORAGE_KEY);
    if (storedVoters) {
      setVoters(JSON.parse(storedVoters));
    }
  }, []);

  // --- HELPER FUNCTIONS ---
  const saveVoters = (updatedVoters: Voter[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVoters));
    setVoters(updatedVoters);
  };

  // --- EVENT HANDLERS ---
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', schoolId: '', photo: '' });
    setValidated(false);
    setShowModal(true);
  };

  const handleEditClick = (voter: Voter) => {
    setEditingId(voter.id);
    setFormData({ name: voter.name, schoolId: voter.schoolId, photo: voter.photo || '' });
    setValidated(false);
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this voter?')) {
      const updatedVoters = voters.filter((voter) => voter.id !== id);
      saveVoters(updatedVoters);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
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

    if (editingId) {
      const updatedVoters = voters.map((voter) =>
        voter.id === editingId ? { ...voter, ...formData } : voter
      );
      saveVoters(updatedVoters);
    } else {
      const newVoter: Voter = { id: uuidv4(), ...formData };
      saveVoters([...voters, newVoter]);
    }

    handleCloseModal();
  };
  
  // --- FILTERING LOGIC ---
  // Filters voters based on the search query. The search is case-insensitive.
  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.schoolId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER ---
  return (
    <>
      <Container fluid className="p-4">
        <Card>
          <Card.Header as="h2" className="fw-bold">
            Voters List
          </Card.Header>
          <Card.Body>
            {/* Toolbar with Add button and Search bar */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <Button variant="primary" onClick={handleAddClick}>
                + Add Voter
              </Button>
              <Form.Control
                type="search"
                placeholder="Search by name or School ID..."
                style={{ maxWidth: '350px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Table bordered hover responsive>
              <thead className="table-info">
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>School ID</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.length > 0 ? (
                  filteredVoters.map((voter, index) => (
                    <tr key={voter.id}>
                      <td>{index + 1}</td>
                      <td className="text-center">
                        <Image
                          src={voter.photo || `https://placehold.co/60x60//?text=No+Photo`}
                          alt={voter.name}
                          roundedCircle
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>{voter.name}</td>
                      <td>{voter.schoolId}</td>
                      <td className="text-center">
                        <Button variant="secondary" size="sm" className="me-2" onClick={() => handleEditClick(voter)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(voter.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      {searchQuery ? "No voters found matching your search." : "No voters have been added yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Voter Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Voter' : 'Add New Voter'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter voter's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
              <Form.Control.Feedback type="invalid">Please provide a name.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>School ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter voter's school ID"
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                required
              />
              <Form.Control.Feedback type="invalid">Please provide a school ID.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {formData.photo && (
                <div className="text-center mt-3">
                  <Image
                    src={formData.photo}
                    alt="Preview"
                    roundedCircle
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default VotersPage;