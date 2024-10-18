import React, {useContext, useState} from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import SecurityService from "../../service/SecurityService";
import {UserContext} from "../../service/UserContext";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const { setIsLoggedIn } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();

        // Użycie metody z SecurityService
        const result = await SecurityService.loginUser(email, password);

        if (result.success) {
            setIsLoggedIn(true); // Ustawiamy stan zalogowania na true
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <Container data-bs-theme="dark" style={{
            height: "100hv",
        }}>
            <Row className="justify-content-md-center">
                <Col md="4">
                    <h2 className="mt-5 text-white" >Logowanie</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label className='text-white'>Adres email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Wprowadź email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mt-3">
                            <Form.Label className='text-white'>Hasło</Form.Label>
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
