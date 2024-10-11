import React, { useState } from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName]   = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/users/', {
                firstName,
                lastName,
                email,
                password,
            });
            navigate('/login');
        } catch (err) {
            setError('Rejestracja nie powiodła się. Spróbuj ponownie.');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5">Rejestracja</h2>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>Imię</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Wprowadź imię"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formLastName">
                                    <Form.Label>Nazwisko</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Wprowadź nazwisko"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Wprowadź email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label>Hasło</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Hasło"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-4">
                            Zarejestruj się
                        </Button>
                    </Form>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
        </Container>
    );
}

export default Register;
