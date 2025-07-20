import React, { useEffect, useState } from 'react';
import { Button, Container, Form, Alert, Card, Row, Col, InputGroup } from 'react-bootstrap';

interface Voter {
  id: string;
  name: string;
  schoolId: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  photo?: string;
}

interface Position {
  name: string;
}

interface Vote {
  voterId: string;
  position: string;
  candidateId: string;
  candidateName: string;
  timestamp: string;
}

const STORAGE_POSITIONS = 'voting-positions';
const STORAGE_CANDIDATES = 'voting-candidates';
const STORAGE_VOTERS = 'voting-voters';
const STORAGE_VOTES = 'voting-votes';
const STORAGE_CURRENT_VOTER_SESSION = 'current-voter-session';
const STORAGE_VOTING_PROGRESS = 'voting-progress-';

export default function Votes() {
  const [schoolId, setSchoolId] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null); // State for selected radio button

  useEffect(() => {
    const storedVoterId = localStorage.getItem(STORAGE_CURRENT_VOTER_SESSION);
    const regVoters: Voter[] = JSON.parse(localStorage.getItem(STORAGE_VOTERS) || '[]');
    const storedVotes: Vote[] = JSON.parse(localStorage.getItem(STORAGE_VOTES) || '[]');
    const pos: Position[] = JSON.parse(localStorage.getItem(STORAGE_POSITIONS) || '[]');
    const cands: Candidate[] = JSON.parse(localStorage.getItem(STORAGE_CANDIDATES) || '[]');

    setPositions(pos);
    setCandidates(cands);
    setVotes(storedVotes);

    if (storedVoterId) {
      const found = regVoters.find(v => v.id === storedVoterId);
      if (found) {
        setVoter(found);
        const savedProgress = localStorage.getItem(STORAGE_VOTING_PROGRESS + found.id);
        const initialPositionIndex = savedProgress ? parseInt(savedProgress) : 0;
        setCurrentPositionIndex(initialPositionIndex);

        // If resuming a vote, set the pre-selected candidate if one exists for the current position
        if (pos.length > 0 && initialPositionIndex < pos.length) {
          const currentPositionName = pos[initialPositionIndex].name;
          const existingVote = storedVotes.find(
            v => v.voterId === found.id && v.position === currentPositionName
          );
          if (existingVote) {
            setSelectedCandidateId(existingVote.candidateId);
          } else {
            setSelectedCandidateId(null);
          }
        }
      } else {
        localStorage.removeItem(STORAGE_CURRENT_VOTER_SESSION);
      }
    }
  }, []);

  // Effect to reset selectedCandidateId when currentPositionIndex changes
  useEffect(() => {
    if (voter && positions.length > 0 && currentPositionIndex < positions.length) {
      const currentPositionName = positions[currentPositionIndex].name;
      const existingVote = votes.find(
        v => v.voterId === voter.id && v.position === currentPositionName
      );
      setSelectedCandidateId(existingVote ? existingVote.candidateId : null);
    } else {
      setSelectedCandidateId(null);
    }
  }, [currentPositionIndex, voter, positions, votes]);


  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const regVoters: Voter[] = JSON.parse(localStorage.getItem(STORAGE_VOTERS) || '[]');
    const found = regVoters.find(v => v.schoolId === schoolId.trim());
    if (found) {
      setVoter(found);
      localStorage.setItem(STORAGE_CURRENT_VOTER_SESSION, found.id);
      setCurrentPositionIndex(0); // Reset progress on new login
      setLoginError(false); // Clear any previous login errors

      // Check for existing vote for the first position if voter has existing votes
      if (positions.length > 0) {
        const currentPositionName = positions[0].name;
        const existingVote = votes.find(
          v => v.voterId === found.id && v.position === currentPositionName
        );
        setSelectedCandidateId(existingVote ? existingVote.candidateId : null);
      }
    } else {
      setLoginError(true);
    }
  }

  function handleVoteSubmit() {
    if (!voter || !selectedCandidateId || currentPositionIndex >= positions.length) return;

    const currentPosition = positions[currentPositionIndex];
    const candidateToVoteFor = candidates.find(c => c.id === selectedCandidateId);

    if (!candidateToVoteFor) {
      alert('Please select a candidate to vote.');
      return;
    }

    const newVote: Vote = {
      voterId: voter.id,
      position: currentPosition.name,
      candidateId: candidateToVoteFor.id,
      candidateName: `${candidateToVoteFor.firstName} ${candidateToVoteFor.lastName}`,
      timestamp: new Date().toISOString(),
    };

    // Remove existing vote for this position by this voter before adding the new one
    const updatedVotes = votes.filter(
      v => !(v.voterId === voter.id && v.position === currentPosition.name)
    );
    updatedVotes.push(newVote);

    setVotes(updatedVotes);
    localStorage.setItem(STORAGE_VOTES, JSON.stringify(updatedVotes));

    // Save voting progress
    const nextPositionIndex = currentPositionIndex + 1;
    localStorage.setItem(
      STORAGE_VOTING_PROGRESS + voter.id,
      nextPositionIndex.toString()
    );

    setCurrentPositionIndex(nextPositionIndex);
    setSelectedCandidateId(null); // Clear selection for the next position
  }

  function resetVotes() {
    if (!voter) return;
    const filtered = votes.filter(v => v.voterId !== voter.id);
    setVotes(filtered);
    setCurrentPositionIndex(0);
    localStorage.setItem(STORAGE_VOTES, JSON.stringify(filtered));
    localStorage.removeItem(STORAGE_VOTING_PROGRESS + voter.id);
    setSelectedCandidateId(null); // Clear selection
  }

  function logout() {
    setVoter(null);
    setSchoolId('');
    setCurrentPositionIndex(0);
    localStorage.removeItem(STORAGE_CURRENT_VOTER_SESSION);
    setSelectedCandidateId(null); // Clear selection on logout
  }

  if (!voter) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card className="p-4 shadow-lg" style={{ width: '400px' }}>
          <Card.Body>
            <h2 className="text-center mb-4">Voter Login</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>School ID</Form.Label>
                <Form.Control
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  placeholder="Enter your School ID"
                  required
                  size="lg"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100" size="lg">
                Login
              </Button>
              {loginError && <Alert variant="danger" className="mt-3">Invalid School ID. Please try again.</Alert>}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (currentPositionIndex >= positions.length) {
    return (
      <Container className="my-5 text-center">
        <Card className="p-5 shadow-lg">
            <Card.Body>
                <h2 className="text-success mb-3">Voting Complete!</h2>
                <p className="lead">Thank you for participating in the election.</p>
                <div className="mt-4">
                    <Button variant="secondary" onClick={logout} className="me-2">Vote Again</Button>
                    <Button variant="danger" onClick={resetVotes}>Reset My Votes</Button>
                </div>
            </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = candidates.filter(c => c.position === currentPosition.name);

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Vote for: <strong>{currentPosition.name}</strong></h2>
      
      <Row className="justify-content-center">
        {currentCandidates.map(candidate => (
          <Col key={candidate.id} md={6} lg={4} className="mb-4">
            <Card
              className={`h-100 text-center ${selectedCandidateId === candidate.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedCandidateId(candidate.id)}
              style={{ cursor: 'pointer' }}
            >
              {candidate.photo && (
                <Card.Img
                  variant="top"
                  src={candidate.photo}
                  alt={`${candidate.firstName} ${candidate.lastName}`}
                  style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', margin: '20px auto 0' }}
                />
              )}
              <Card.Body>
                <Card.Title>{`${candidate.firstName} ${candidate.lastName}`}</Card.Title>
                <Form.Check
                    type="radio"
                    id={`candidate-${candidate.id}`}
                    name="candidateSelection"
                    checked={selectedCandidateId === candidate.id}
                    onChange={() => setSelectedCandidateId(candidate.id)}
                    label="Select"
                  />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleVoteSubmit}
          disabled={!selectedCandidateId}
        >
          Submit Vote for {currentPosition.name}
        </Button>
      </div>

      <div className="mt-5 d-flex justify-content-between">
        {currentPositionIndex > 0 && (
          <Button
            variant="outline-secondary"
            onClick={() => setCurrentPositionIndex(prev => prev - 1)}
          >
            &larr; Previous Position
          </Button>
        )}
        <Button variant="danger" onClick={logout}>Logout</Button>
      </div>
    </Container>
  );
}
