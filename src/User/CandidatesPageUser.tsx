import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Collapse, Form } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaUser, FaVoteYea, FaGraduationCap, FaQuoteLeft, FaSearch } from 'react-icons/fa';

const STORAGE_CANDIDATES = 'voting-candidates';
const STORAGE_POSITIONS = 'voting-positions';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  course?: string;
  platform: string;
  photo?: string;
}

interface Position {
  id: string;
  name: string;
  description: string;
}

const CandidatesPageUser: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  useEffect(() => {
    // Load candidates and positions from localStorage
    const storedCandidates = JSON.parse(localStorage.getItem(STORAGE_CANDIDATES) || '[]');
    const storedPositions = JSON.parse(localStorage.getItem(STORAGE_POSITIONS) || '[]');

    // Add temporary placeholder images if none exist
    const candidatesWithPlaceholders = storedCandidates.map((candidate: Candidate) => ({
      ...candidate,
      photo: candidate.photo || `https://i.pravatar.cc/150?u=${candidate.id}`
    }));

    setCandidates(candidatesWithPlaceholders);
    setPositions(storedPositions);
  }, []);

  // Filter candidates based on search and position filter
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = `${candidate.firstName} ${candidate.lastName} ${candidate.position} ${candidate.course} ${candidate.platform}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesPosition = selectedPosition === '' || candidate.position === selectedPosition;
    
    return matchesSearch && matchesPosition;
  });

  // Group filtered candidates by position
  const candidatesByPosition = filteredCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.position]) {
      acc[candidate.position] = [];
    }
    acc[candidate.position].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>);

  // Toggle platform visibility
  const togglePlatform = (candidateId: string) => {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedPlatforms(newExpanded);
  };

  // Get position name by ID or name
  const getPositionName = (positionId: string) => {
    if (positions.length > 0 && typeof positions[0] === 'object' && 'id' in positions[0]) {
      const position = positions.find((p: any) => p.id === positionId);
      return position ? position.name : positionId;
    }
    return positionId;
  };

  // Get unique positions for filter dropdown
  const uniquePositions = [...new Set(candidates.map(candidate => candidate.position))];

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="text-center mb-5">
        <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
          <FaVoteYea size={32} className="text-primary" />
        </div>
        <h1 className="fw-bold mb-3">Meet the Candidates</h1>
        <p className="lead text-muted mb-4">
          Learn about the candidates running for each position
        </p>
        
        {/* Search and Filter */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8 col-lg-6">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <FaSearch className="text-muted" />
              </span>
              <Form.Control
                type="search"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select 
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                style={{ maxWidth: '180px' }}
              >
                <option value="">All Positions</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {getPositionName(position)}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-center gap-3">
          <Badge bg="light" text="dark" className="px-3 py-2">
            <FaUser className="me-2" />
            {candidates.length} Candidates
          </Badge>
          <Badge bg="light" text="dark" className="px-3 py-2">
            <FaGraduationCap className="me-2" />
            {Object.keys(candidatesByPosition).length} Positions
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      {Object.keys(candidatesByPosition).length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-light d-inline-flex p-4 rounded-circle mb-4">
            <FaUser size={32} className="text-muted" />
          </div>
          <h4 className="text-muted mb-3">
            {searchTerm || selectedPosition ? 'No matching candidates found' : 'No Candidates Available'}
          </h4>
          <p className="text-muted mb-4">
            {searchTerm || selectedPosition 
              ? 'Try adjusting your search or filter criteria'
              : 'Check back later when candidates have registered.'}
          </p>
          {(searchTerm || selectedPosition) && (
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setSearchTerm('');
                setSelectedPosition('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        Object.entries(candidatesByPosition).map(([positionId, positionCandidates]) => (
          <div key={positionId} className="mb-5">
            {/* Position Header */}
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary text-white rounded p-2 me-3">
                <FaVoteYea size={20} />
              </div>
              <div>
                <h2 className="mb-1">{getPositionName(positionId)}</h2>
                <p className="text-muted mb-0">
                  {positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Candidates Grid */}
            <Row className="g-4">
              {positionCandidates.map((candidate) => (
                <Col md={6} lg={4} key={candidate.id}>
                  <Card className="h-100 shadow-sm">
                    <div className="text-center p-3">
                      <img
                        src={candidate.photo}
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                        className="rounded-circle border mb-3"
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover'
                        }}
                      />
                      <Card.Title className="mb-2">
                        {candidate.firstName} {candidate.lastName}
                      </Card.Title>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                        <Badge bg="primary" className="text-white">
                          {getPositionName(candidate.position)}
                        </Badge>
                        {candidate.course && (
                          <Badge bg="light" text="dark">
                            {candidate.course}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Card.Body className="pt-0">
                      <Button
                        variant={expandedPlatforms.has(candidate.id) ? "primary" : "outline-primary"}
                        onClick={() => togglePlatform(candidate.id)}
                        className="w-100 mb-3 d-flex align-items-center justify-content-center"
                      >
                        <FaQuoteLeft className="me-2" />
                        {expandedPlatforms.has(candidate.id) ? 'Hide' : 'Show'} Platform
                        {expandedPlatforms.has(candidate.id) ?
                          <FaChevronUp className="ms-2" /> :
                          <FaChevronDown className="ms-2" />
                        }
                      </Button>

                      <Collapse in={expandedPlatforms.has(candidate.id)}>
                        <div>
                          <div className="p-3 bg-light rounded">
                            <h6 className="text-primary mb-2">Platform Statement</h6>
                            <p className="mb-0">
                              {candidate.platform || 'No platform statement provided.'}
                            </p>
                          </div>
                        </div>
                      </Collapse>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}

      {/* Election Summary */}
      {candidates.length > 0 && (
        <Card className="border-0 shadow-sm mt-5">
          <Card.Body className="p-4">
            <h3 className="text-center mb-4">Election Summary</h3>
            <Row className="text-center">
              <Col md={4} className="mb-4 mb-md-0">
                <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                  <FaVoteYea size={24} className="text-primary" />
                </div>
                <h3 className="mb-1">{Object.keys(candidatesByPosition).length}</h3>
                <p className="text-muted mb-0">Positions</p>
              </Col>
              <Col md={4} className="mb-4 mb-md-0">
                <div className="bg-success bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                  <FaUser size={24} className="text-success" />
                </div>
                <h3 className="mb-1">{filteredCandidates.length}</h3>
                <p className="text-muted mb-0">Candidates</p>
              </Col>
              <Col md={4}>
                <div className="bg-warning bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                  <FaQuoteLeft size={24} className="text-warning" />
                </div>
                <h3 className="mb-1">Read</h3>
                <p className="text-muted mb-0">Platforms</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CandidatesPageUser;