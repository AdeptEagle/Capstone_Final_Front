import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Table,
  Modal,
  Form,
  Card,
  Alert,
} from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'; // Using react-icons for a professional look

// --- INTERFACES AND CONSTANTS ---
interface Position {
  id: string;
  name: string;
  voteLimit: number;
}

interface FormErrors {
  name?: string;
  voteLimit?: string;
}

const STORAGE_KEY = 'voting-positions';

// --- INITIAL DATA (Consider moving to its own file, e.g., 'initialPositions.ts') ---
const getInitialPositions = (): Position[] => {
  return [
    'President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor',
    'Public Information Officer (Internal)', 'Public Information Officer (External)',
    'Senator 1', 'Senator 2', 'Senator 3', 'Senator 4',
    'Senator 5', 'Senator 6', 'Senator 7', 'Senator 8',
  ].map(title => ({
    id: uuidv4(),
    name: title,
    voteLimit: 1,
  }));
};


// --- MAIN COMPONENT ---
const PositionManager: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // --- Effects ---
  useEffect(() => {
    const storedPositions = localStorage.getItem(STORAGE_KEY);
    if (storedPositions) {
      setPositions(JSON.parse(storedPositions));
    } else {
      const initialData = getInitialPositions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      setPositions(initialData);
    }
  }, []);

  // --- Data Handling ---
  const savePositions = (updatedPositions: Position[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPositions));
    setPositions(updatedPositions);
  };

  // --- Modal Triggers ---
  const handleShowAddModal = () => {
    setCurrentPosition(null);
    setErrors({});
    setShowFormModal(true);
  };

  const handleShowEditModal = (position: Position) => {
    setCurrentPosition(position);
    setErrors({});
    setShowFormModal(true);
  };

  const handleShowDeleteModal = (id: string) => {
    setShowDeleteModal(id);
  };

  const handleCloseModals = () => {
    setShowFormModal(false);
    setShowDeleteModal(null);
  };

  // --- CRUD Operations ---
  const handleSave = (positionData: { name: string; voteLimit: number }) => {
    const { name, voteLimit } = positionData;

    // Validation
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Position name cannot be empty.';
    } else if (positions.some(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== currentPosition?.id)) {
      newErrors.name = 'This position name already exists.';
    }
    if (voteLimit < 1) {
      newErrors.voteLimit = 'Vote limit must be at least 1.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false; // Indicate failure
    }

    if (currentPosition) {
      // Editing existing position
      const updated = positions.map(p =>
        p.id === currentPosition.id ? { ...p, name: name.trim(), voteLimit } : p
      );
      savePositions(updated);
    } else {
      // Adding new position
      const newPosition: Position = { id: uuidv4(), name: name.trim(), voteLimit };
      savePositions([...positions, newPosition]);
    }
    handleCloseModals();
    return true; // Indicate success
  };

  const handleDelete = () => {
    if (showDeleteModal) {
      const updated = positions.filter(p => p.id !== showDeleteModal);
      savePositions(updated);
      handleCloseModals();
    }
  };

  // --- Render ---
  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Card>
        <Card.Header as="h2" className="fw-bold">
          Position Management
        </Card.Header>
        <Card.Body>
          <Button variant="primary" onClick={handleShowAddModal} className="mb-3 d-flex align-items-center">
            <FiPlus className="me-2" /> Add New Position
          </Button>

          <PositionTable
            positions={positions}
            onEdit={handleShowEditModal}
            onDelete={handleShowDeleteModal}
          />

          {showFormModal && (
            <PositionFormModal
              show={showFormModal}
              onHide={handleCloseModals}
              onSave={handleSave}
              position={currentPosition}
              initialErrors={errors}
            />
          )}

          {showDeleteModal && (
            <DeleteConfirmationModal
              show={!!showDeleteModal}
              onHide={handleCloseModals}
              onConfirm={handleDelete}
              positionName={positions.find(p => p.id === showDeleteModal)?.name || ''}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};


// --- SUB-COMPONENTS ---

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
}

const PositionTable: React.FC<PositionTableProps> = ({ positions, onEdit, onDelete }) => (
  <Table bordered hover responsive>
    <thead className="table-info">
      <tr>
        <th>#</th>
        <th>Position Title</th>
        <th>Vote Limit</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {positions.length > 0 ? (
        positions.map((pos, index) => (
          <tr key={pos.id}>
            <td>{index + 1}</td>
            <td>{pos.name}</td>
            <td>{pos.voteLimit}</td>
            <td className="text-center">
              <Button variant="secondary" size="sm" onClick={() => onEdit(pos)} className="me-2">
                <FiEdit /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(pos.id)}>
                <FiTrash2 /> Delete
              </Button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={4} className="text-center">No positions have been created yet.</td>
        </tr>
      )}
    </tbody>
  </Table>
);


interface PositionFormModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: { name: string; voteLimit: number }) => boolean;
  position: Position | null;
  initialErrors: FormErrors;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({ show, onHide, onSave, position, initialErrors }) => {
  const [name, setName] = useState(position?.name || '');
  const [voteLimit, setVoteLimit] = useState(position?.voteLimit || 1);
  const [errors, setErrors] = useState(initialErrors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onSave({ name, voteLimit });
    if (!success) {
      // Errors will be updated by the parent, so we just need to re-render
      // This part is tricky; a more advanced state manager would be better.
      // For now, we rely on the parent to pass down new errors.
    }
  };

  useEffect(() => {
    setErrors(initialErrors);
  }, [initialErrors]);


  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{position ? 'Edit Position' : 'Add New Position'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Position Name *</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vote Limit *</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={voteLimit}
              onChange={(e) => setVoteLimit(parseInt(e.target.value, 10))}
              isInvalid={!!errors.voteLimit}
            />
            <Form.Control.Feedback type="invalid">{errors.voteLimit}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};


interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  positionName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ show, onHide, onConfirm, positionName }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Deletion</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Alert variant="danger">
        Are you sure you want to permanently delete the position: <strong>{positionName}</strong>? This action cannot be undone.
      </Alert>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>Delete Position</Button>
    </Modal.Footer>
  </Modal>
);

export default PositionManager;