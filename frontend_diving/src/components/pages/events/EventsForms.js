import React, { useState } from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import moment from 'moment';
import EventsService from "../../../service/EventsService";
import SecurityService from "../../../service/SecurityService";

// Formularz do tworzenia nowego wydarzenia
export const CreateEventForm = ({ onAddEvent, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(start) >= new Date(end)) {
            setError('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
            return;
        }
        const result = await EventsService.addEvent(title, description, start, end)
        if(result.success){
            const newEvent = {
                title,
                start: new Date(start),
                end: new Date(end),
            };
            onAddEvent(newEvent);
        }else {
            setError(result.message);
        }
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

                        <Form.Group controlId="formDescription" className="mt-3">
                            <Form.Label className='text-white'>Opis</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wprowadź opis"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
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
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("RegisterForm")

        try {
            const userEmail = SecurityService.getCurrentUserEmail(); // Zakładamy, że istnieje metoda zwracająca ID zalogowanego użytkownika
            const eventId = event.eventId;
            const response = await EventsService.registerForEvent(userEmail, eventId, message);
            if (response.success) {
                setSuccess('Zarejestrowano na wydarzenie!');
                onCancel();
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error(err)
            setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
        }
    };

    return (
        <Container data-bs-theme="dark">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5 text-white">Rejestracja na wydarzenie: {event.title}</h2>
                    <p className='fs-4 text-white'>{event.description}</p>
                    <p className='text-white'>
                        Start: {moment(event.start).format('LLL')} <br />
                        Koniec: {moment(event.end).format('LLL')}
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formName" className="mt-3">
                            <Form.Label className='text-white'>Wiadomość</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wprowadź wiadomość"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
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