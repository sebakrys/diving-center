import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import UsersService from "../../../service/UsersService";


const ResetPasswordPage = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await UsersService.resetPassword(token, newPassword);
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
            <h2>Nowe hasło</h2>
            {message && (
                <Alert variant={error ? 'danger' : 'success'}>{message}</Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="newPassword">
                    <Form.Label>Nowe hasło</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Podaj nowe hasło"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Zmień hasło
                </Button>
            </Form>
        </Container>
    );
};

export default ResetPasswordPage;
