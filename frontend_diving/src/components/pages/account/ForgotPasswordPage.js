import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import UsersService from "../../../service/UsersService";


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await UsersService.requestPasswordReset(email);
        if (result.success) {
            setMessage(result.message);
            setError(false);
        } else {
            setMessage(result.error);
            setError(true);
        }
    };

    return (
        <Container className={"text-white"}>
            <h2>Nie pamiętam hasła</h2>
            {message && (
                <Alert variant={error ? 'danger' : 'success'}>{message}</Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Podaj swój e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Wyślij
                </Button>
            </Form>
        </Container>
    );
};

export default ForgotPasswordPage;
