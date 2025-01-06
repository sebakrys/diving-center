import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import UsersService from "../../../service/UsersService";


const ActivateAccountPage = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const activateAccount = async () => {
            const result = await UsersService.activateUser(token);
            if (result.success) {
                setMessage('Konto zostało pomyślnie aktywowane.');
                setError(false);
            } else {
                setMessage(result.error || 'Nieprawidłowy token aktywacyjny.');
                setError(true);
            }
        };

        activateAccount();
    }, [token]);

    return (
        <Container className={"text-white"}>
            <h2>Aktywacja użytkownika</h2>
            <Alert variant={error ? 'danger' : 'success'}>{message}</Alert>
        </Container>
    );
};

export default ActivateAccountPage;
