import React, { useState } from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import SecurityService from "../../service/SecurityService";

function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName]   = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();

        const result = await SecurityService.registerUser(firstName, lastName, email, password);

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <Container data-bs-theme="dark">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5 text-white">Rejestracja</h2>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label className='text-white'>Imię</Form.Label>
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
                                    <Form.Label className='text-white'>Nazwisko</Form.Label>
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
                            <Form.Label className='text-white'>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Wprowadź email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mt-3">
                            <Form.Label className='text-white'>Hasło</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Hasło"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/*TODO dodac capcha*/}

                        <Button variant="primary" type="submit" className="mt-4">
                            Zarejestruj się
                        </Button>
                    </Form>
                    <div className="mt-3 mb-5">
                        <p className="text-white d-inline">Masz juz konto? </p><a href={"/#/register"}>Zaloguj się</a>
                    </div>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
        </Container>
    );
}

export default Register;
