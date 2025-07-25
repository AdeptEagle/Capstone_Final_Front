import React from 'react';
import { Container, Card } from 'react-bootstrap';

const HomePage: React.FC = () => (
    <Container>
        <h1 className="mb-4">Announcements</h1>
        <Card className="mb-3"><Card.Body><Card.Title>Election Schedule</Card.Title><Card.Text>The election will be held on <strong>July 15, 2025</strong> from <strong>8:00 AM to 5:00 PM</strong>.</Card.Text></Card.Body></Card>
        <Card className="mb-3"><Card.Body><Card.Title>Voting Guidelines</Card.Title><ul><li>Ensure you are registered to vote.</li><li>Use your unique School ID to log in and cast your vote.</li><li>Follow the on-screen instructions carefully.</li></ul></Card.Body></Card>
    </Container>
);
export default HomePage;