import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, ListGroup, Spinner } from 'react-bootstrap';
import './App.css';


interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const HomePage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        // Set the target date for the election countdown
        const electionDate = new Date("2025-08-15T08:00:00").getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = electionDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Helper function to format time values with a leading zero
    const formatTime = (time: number) => String(time).padStart(2, '0');

    return (
        <Container className="py-4">
            {/* --- Hero Section --- */}
            <div className="hero-section">
                <h1 className="display-4">Student Election Portal</h1>
                <p className="lead mt-3">
                    Your voice, your vote. Participate in a fair, secure, and transparent election process to shape our future.
                </p>
                <Button variant="light" size="lg" className="mt-3 fw-bold">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Cast Your Vote Now
                </Button>
            </div>
            
            {/* --- Countdown Section --- */}
            <section className="my-5">
                <h2 className="text-center section-title">Election Countdown</h2>
                {timeLeft ? (
                    <Row className="justify-content-center">
                        <Col xs={6} md={3} lg={2} className="mb-3">
                            <Card className="countdown-card p-3">
                                <p className="display-4 mb-0">{formatTime(timeLeft.days)}</p>
                                <p className="text-muted mb-0">Days</p>
                            </Card>
                        </Col>
                        <Col xs={6} md={3} lg={2} className="mb-3">
                            <Card className="countdown-card p-3">
                                <p className="display-4 mb-0">{formatTime(timeLeft.hours)}</p>
                                <p className="text-muted mb-0">Hours</p>
                            </Card>
                        </Col>
                        <Col xs={6} md={3} lg={2} className="mb-3">
                            <Card className="countdown-card p-3">
                                <p className="display-4 mb-0">{formatTime(timeLeft.minutes)}</p>
                                <p className="text-muted mb-0">Minutes</p>
                            </Card>
                        </Col>
                        <Col xs={6} md={3} lg={2} className="mb-3">
                           <Card className="countdown-card p-3">
                                <p className="display-4 mb-0">{formatTime(timeLeft.seconds)}</p>
                                <p className="text-muted mb-0">Seconds</p>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                     <div className="text-center"><Spinner animation="border" variant="primary" /></div>
                )}
            </section>

            {/* --- Main Information Grid --- */}
            <main className="mt-5">
                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="feature-card">
                            <Card.Body className="p-4">
                                <Card.Title><i className="bi bi-card-checklist"></i>How to Vote</Card.Title>
                                <ListGroup variant="flush" className="mt-3">
                                    <ListGroup.Item>Use your unique School ID to log in.</ListGroup.Item>
                                    <ListGroup.Item>Browse candidates and their platforms.</ListGroup.Item>
                                    <ListGroup.Item>Select your choices and review your ballot.</ListGroup.Item>
                                    <ListGroup.Item>Submit your vote securely.</ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="feature-card">
                            <Card.Body className="p-4">
                                <Card.Title><i className="bi bi-calendar2-event"></i>Key Dates</Card.Title>
                                 <ListGroup variant="flush" className="mt-3">
                                    <ListGroup.Item><b>Voting Opens:</b> Aug 15, 2025, 8:00 AM</ListGroup.Item>
                                    <ListGroup.Item><b>Voting Closes:</b> Aug 15, 2025, 5:00 PM</ListGroup.Item>
                                    <ListGroup.Item><b>Results:</b> Aug 16, 2025, 12:00 PM</ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="feature-card">
                            <Card.Body className="p-4">
                                <Card.Title><i className="bi bi-people-fill"></i>Meet Candidates</Card.Title>
                                <Card.Text className="text-muted mt-3">
                                    Get to know the candidates running for office. Read their manifestos, watch their videos, and make an informed decision.
                                </Card.Text>
                                <Button variant="link" className="p-0 fw-bold text-decoration-none">Explore Candidate Profiles <i className="bi bi-arrow-right-short"></i></Button>
                            </Card.Body>
                        </Card>
                    </Col>
                     <Col md={6} className="mb-4">
                        <Card className="feature-card">
                            <Card.Body className="p-4">
                                <Card.Title><i className="bi bi-shield-check"></i>Voter Guidelines</Card.Title>
                                <Card.Text className="text-muted mt-3">
                                    Ensure a smooth voting experience by following our guidelines. Remember, each student is entitled to one vote per position.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </main>

            {/* --- Footer --- */}
            <footer className="text-center mt-5 text-muted small">
                <p>&copy; {new Date().getFullYear()} University of Benedicto College. All Rights Reserved.</p>
                <p>Built for a fair and transparent democratic process.</p>
            </footer>
        </Container>
    );
};

export default HomePage;
