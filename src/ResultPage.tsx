import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Alert
} from 'react-bootstrap';
import {
  BarChart,
  PeopleFill,
  ClockHistory,
  PersonBadge,
  TrophyFill,
  BoxSeam
} from 'react-bootstrap-icons';

// --- Professional App Layout Styles ---
const styles = `
  .dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full viewport height */
    background-color: #f4f6f9;
  }
  .dashboard-header {
    flex-shrink: 0; /* Header doesn't shrink */
  }
  .dashboard-content {
    flex-grow: 1; /* Content area takes up remaining space */
    overflow-y: hidden; /* Hide the scrollbar on the row itself */
  }
  .scrollable-col {
    height: 100%;
    overflow-y: auto; /* Allow this column to scroll if its content is too tall */
  }
  .top-candidate-item {
    background-color: #f8f9fa;
    border: 1px solid #e6e9ed;
  }
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }
`;

// --- Constants & Types ---
const STORAGE_KEYS = {
  POSITIONS: 'voting-positions',
  CANDIDATES: 'voting-candidates',
  VOTERS: 'voting-voters',
  VOTES: 'voting-votes',
};
const POSITION_ORDER = ["President", "Vice President", "Secretary", "Treasurer", "Auditor", "Public Information Officer", "Peace Officer"];
interface Position { name: string; }
interface Candidate { id: string; firstName: string; lastName: string; position: string; }
interface Vote { voterId: string; position: string; candidateId: string; }

// --- Helper Functions ---
const formatTime = (timeInSeconds: number) => {
  if (timeInSeconds < 0) return '00:00:00';
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
};

// --- Custom Hook for Data Logic ---
const useElectionData = () => {
    // ... (This hook code is unchanged from the previous version)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    positions: Position[];
    candidates: Candidate[];
    voters: string[];
    votes: Vote[];
  }>({ positions: [], candidates: [], voters: [], votes: [] });

  useEffect(() => {
    try {
      const pos = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSITIONS) || '[]');
      const cands = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]');
      const vts = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES) || '[]');
      const votersList = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTERS) || '[]');
      setData({ positions: pos, candidates: cands, votes: vts, voters: votersList });
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const electionStats = useMemo(() => {
    const { positions, candidates, voters, votes } = data;
    const totalVotes = votes.length;
    const votersVotedCount = new Set(votes.map(v => v.voterId)).size;
    const voterTurnout = voters.length > 0 ? ((votersVotedCount / voters.length) * 100).toFixed(0) : '0';

    const votesPerPosition = positions
      .map(pos => ({
        name: pos.name,
        count: votes.filter(vote => vote.position === pos.name).length,
      }))
      .sort((a, b) => {
        const orderA = POSITION_ORDER.indexOf(a.name);
        const orderB = POSITION_ORDER.indexOf(b.name);
        return (orderA === -1 ? Infinity : orderA) - (orderB === -1 ? Infinity : orderB);
      });

    const topCandidates = candidates
      .map(candidate => ({
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        position: candidate.position,
        voteCount: votes.filter(v => v.candidateId === candidate.id).length,
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 5);

    return { totalVotes, voterTurnout, votesPerPosition, topCandidates };
  }, [data]);

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const electionEndTime = new Date().getTime() + (2 * 3600 + 30 * 60 + 45) * 1000;
    const timerInterval = setInterval(() => {
      setTimeLeft(formatTime((electionEndTime - new Date().getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  return { loading, ...electionStats, timeLeft };
};

// --- Child Components ---
const SummaryCard = ({ icon, title, value, tooltipText }: { icon: React.ReactNode, title: string, value: string | number, tooltipText?: string }) => {
    const cardContent = (
      <Card className="p-2 shadow-sm text-center h-100">
        <Row className="g-0 align-items-center h-100">
          <Col xs={4} className="fs-2 text-primary opacity-50">{icon}</Col>
          <Col xs={8}>
            <div className="small text-muted">{title}</div>
            <h5 className="fw-bold mb-0">{value}</h5>
          </Col>
        </Row>
      </Card>
    );
  
    if (tooltipText) {
      return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltipText}</Tooltip>}>
          {cardContent}
        </OverlayTrigger>
      );
    }
    return cardContent;
  };
  
  const VotesPerPositionChart = ({ data }: { data: { name: string, count: number }[] }) => {
    const maxVotes = useMemo(() => Math.max(...data.map(p => p.count), 0), [data]);
    const chartMax = Math.ceil(maxVotes / 50) * 50 || 50;
    const axisLabels = Array.from({ length: chartMax / 50 + 1 }, (_, i) => i * 50);
  
    return (
      <Card className="p-3 shadow-sm h-100">
        <Card.Title className="fw-bold m-0 border-bottom pb-2 mb-2">
          <BarChart className="me-2" /> Total Votes per Position
        </Card.Title>
        {data.length === 0 ? (
           <Alert variant="info" className="mt-3 text-center small">No positions found.</Alert>
        ) : (
          <div className="pt-2">
            {data.map((pos) => (
              <Row key={pos.name} className="align-items-center mb-2 gx-2">
                <Col xs={4} md={3} className="text-end">
                  <p className="mb-0 text-muted small">{pos.name}</p>
                </Col>
                <Col xs={8} md={9}>
                  <ProgressBar
                    now={(pos.count / chartMax) * 100}
                    label={`${pos.count}`}
                    striped
                    animated
                    style={{ height: '20px', fontSize: '0.75rem' }}
                  />
                </Col>
              </Row>
            ))}
            <Row className="gx-2 mt-1">
              <Col xs={4} md={3}></Col>
              <Col xs={8} md={9} className="border-top pt-1 d-flex justify-content-between">
                {axisLabels.map(label => <span key={label} className="text-muted small">{label}</span>)}
              </Col>
            </Row>
          </div>
        )}
      </Card>
    );
  };
  
  const TopCandidatesList = ({ data }: { data: { id: string, name: string, position: string, voteCount: number }[] }) => (
    <Card className="p-3 shadow-sm h-100">
      <Card.Title className="fw-bold mb-2"><TrophyFill className="me-2" /> Top Candidates</Card.Title>
      {data.length === 0 ? (
         <Alert variant="info" className="text-center small">No votes have been cast yet.</Alert>
      ) : (
        data.map((candidate) => (
          <div key={candidate.id} className="d-flex justify-content-between align-items-center mb-1 p-2 rounded top-candidate-item">
            <div className="d-flex align-items-center">
              <div className="me-2 fs-5 text-primary"><PersonBadge /></div>
              <div>
                <div className="fw-bold small">{candidate.name}</div>
                <small className="text-muted">{candidate.position}</small>
              </div>
            </div>
            <strong className="fs-6 text-primary">{candidate.voteCount}</strong>
          </div>
        ))
      )}
    </Card>
  );
  
  const LoadingSpinner = () => (
      <div className="loading-spinner">
          <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading...</span>
          </Spinner>
      </div>
  );


// --- Main Page Component ---
export default function DashboardPage() {
  const { loading, totalVotes, voterTurnout, timeLeft, votesPerPosition, topCandidates } = useElectionData();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <header className="dashboard-header p-3">
            <h3 className="fw-bold m-0">SSC Election Dashboard</h3>
        </header>

        <Container fluid className="dashboard-content px-3 pb-3">
            <Row className="h-100">
                {/* Main Content Column */}
                <Col lg={8} className="mb-3 mb-lg-0 h-100 scrollable-col">
                    <VotesPerPositionChart data={votesPerPosition} />
                </Col>

                {/* Right Sidebar Column */}
                <Col lg={4} className="h-100 scrollable-col">
                    <Row>
                        <Col xs={12} sm={6} lg={12} className="mb-3">
                            <SummaryCard icon={<BoxSeam />} title="Total Votes Cast" value={totalVotes.toLocaleString()} />
                        </Col>
                        <Col xs={12} sm={6} lg={12} className="mb-3">
                            <SummaryCard 
                                icon={<PeopleFill />} 
                                title="Voter Turnout" 
                                value={`${voterTurnout}%`} 
                                tooltipText="Percentage of registered voters who have cast a vote."
                            />
                        </Col>
                        <Col xs={12} className="mb-3">
                            <SummaryCard icon={<ClockHistory />} title="Time Left" value={timeLeft || '00:00:00'} />
                        </Col>
                    </Row>
                    <TopCandidatesList data={topCandidates} />
                </Col>
            </Row>
        </Container>
      </div>
    </>
  );
}