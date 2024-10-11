import React, { useState } from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();


        try {
            const response = await axios.post('http://localhost:8080/authenticate', {
                email,
                password,
            });
            const token = response.data.jwt;
            localStorage.setItem('token', token);
            navigate('/');
        } catch (err) {
            setError('Nieprawidłowy email lub hasło');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="4">
                    <h2 className="mt-5">Logowanie</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Wprowadź email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mt-3">
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
                            Zaloguj się
                        </Button>
                    </Form>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
        </Container>
    );
}

export default Login;
