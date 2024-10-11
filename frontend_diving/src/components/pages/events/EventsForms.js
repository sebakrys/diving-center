import React, { useState } from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import moment from 'moment';

// Formularz do tworzenia nowego wydarzenia
export const CreateEventForm = ({ onAddEvent, onCancel }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (new Date(start) >= new Date(end)) {
            setError('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
            return;
        }
        const newEvent = {
            title,
            start: new Date(start),
            end: new Date(end),
        };
        onAddEvent(newEvent);
    };

    return (
        <Container data-bs-theme="dark">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5 text-white">Tworzenie nowego wydarzenia</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formTitle" className="mt-3">
                            <Form.Label className='text-white'>Tytuł</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wprowadź tytuł"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formStartDate" className="mt-3">
                            <Form.Label className='text-white'>Data rozpoczęcia</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={start}
                                onChange={e => setStart(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formEndDate" className="mt-3">
                            <Form.Label className='text-white'>Data zakończenia</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={end}
                                onChange={e => setEnd(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-4">
                            Dodaj wydarzenie
                        </Button>
                        <Button variant="secondary" type="button" onClick={onCancel} className="mt-4 ms-2">
                            Anuluj
                        </Button>
                    </Form>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Col>
            </Row>
        </Container>
    );
};

// Formularz do zapisywania się na wydarzenie
export const RegisterForm = ({ event, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email) {
            setError('Proszę wypełnić wszystkie pola');
            return;
        }
        console.log('Zapisano na wydarzenie:', event.title, 'Imię:', name, 'Email:', email);
        onCancel(); // Zamknij formularz po rejestracji
    };

    return (
        <Container data-bs-theme="dark">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5 text-white">Rejestracja na wydarzenie: {event.title}</h2>
                    <p className='text-white'>
                        Start: {moment(event.start).format('LLL')} <br />
                        Koniec: {moment(event.end).format('LLL')}
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName" className="mt-3">
                            <Form.Label className='text-white'>Imię</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wprowadź imię"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label className='text-white'>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Wprowadź email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-4">
                            Zarejestruj się
                        </Button>
                        <Button variant="secondary" type="button" onClick={onCancel} className="mt-4 ms-2">
                            Anuluj
                        </Button>
                    </Form>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Col>
            </Row>
        </Container>
    );
};