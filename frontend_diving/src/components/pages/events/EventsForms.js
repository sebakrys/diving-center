import React, {useEffect, useState} from 'react';
import {Form, Button, Container, Row, Col, Alert, Table} from 'react-bootstrap';
import moment from 'moment';
import EventsService from "../../../service/EventsService";
import SecurityService from "../../../service/SecurityService";
import * as Icon from 'react-bootstrap-icons';


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

// Formularz do edycji wybranego wydarzenia
export const EditEventForm = ({ onEditEvent, onCancel, selectedEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    // Używamy useEffect, aby zaktualizować wartości, gdy selectedEvent się zmieni
    useEffect(() => {
        if (selectedEvent) {
            setTitle(selectedEvent.title || '');
            setDescription(selectedEvent.description || '');
            setStart(selectedEvent.start ? new Date(selectedEvent.start).toISOString().slice(0, 16) : '');
            setEnd(selectedEvent.end ? new Date(selectedEvent.end).toISOString().slice(0, 16) : '');
        }
    }, [selectedEvent]); // Ta funkcja wykona się za każdym razem, gdy selectedEvent się zmieni


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(start) >= new Date(end)) {
            setError('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
            return;
        }
        const result = await EventsService.editEvent(title, description, start, end, selectedEvent.eventId)
        if(result.success){
            const newEvent = {
                ...selectedEvent, // Zachowaj inne właściwości eventu (np. id)
                title,
                start: new Date(start),
                end: new Date(end),
            };
            onEditEvent(newEvent);
        }else {
            setError(result.message);
        }
    };

    return (
        <Container data-bs-theme="dark">
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h2 className="mt-5 text-white">Edytowanie wydarzenia</h2>
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
                            Edytuj wydarzenie
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
    const [accepted, setAccepted] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userReservation, setUserReservation] = useState(false);

    useEffect(() => {
        const fetchUserReservation = async () => {
            if (event) {
                try {
                    const userEmail = SecurityService.getCurrentUserEmail(); // Pobieramy email użytkownika
                    const eventId = event.eventId; // Pobieramy ID wydarzenia
                    const response = await EventsService.getEventRegistrationForUserAndEvent(userEmail, eventId); // Wywołujemy API
                    if(response.success){
                        setUserReservation(response.event_registration); // Ustawiamy stan z odpowiedzią
                        setMessage(response.event_registration.message);
                        setAccepted(response.event_registration.accepted)
                        console.log(JSON.stringify(response.event_registration)); // Logujemy rejestrację w konsoli
                    }else{
                        setUserReservation(false);
                        setMessage('');
                        setAccepted(false)
                    }
                } catch (error) {
                    console.error('Błąd podczas pobierania rejestracji użytkownika:', error);
                }
            }
        };

        fetchUserReservation(); // Wywołujemy asynchroniczną funkcję
    }, [event]); // Efekt uruchomi się za każdym razem, gdy `event` się zmieni

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("RegisterForm")
        //TODO jesli juz jest to edytuj wiadomosc zamiast dodawać i sypać błędem

        try {
            const userEmail = SecurityService.getCurrentUserEmail();
            const eventId = event.eventId;
            let response;

            if(userReservation){
                response = await EventsService.editRegisterForEventMessage(userEmail, eventId, message);
            }else{
                response = await EventsService.registerForEvent(userEmail, eventId, message);
            }

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

                    {userReservation && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <p className='text-success fw-bold' style={{ marginRight: '10px' }}>
                                Rejestracja: <Icon.Check2 />
                            </p>
                            {accepted ? (
                                <p className='text-success fw-bold'>
                                    Akceptacja: <Icon.Check2All />
                                </p>
                            ) : (
                                <p className='text-warning'>
                                    Akceptacja: <Icon.XLg />
                                </p>
                            )}
                        </div>
                    )}


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

                        {userReservation ?
                            <Button variant="warning" type="submit" className="mt-4">
                                Edytuj Wiadomość
                            </Button>
                            :
                            <Button variant="primary" type="submit" className="mt-4">
                                Zarejestruj się
                            </Button>
                        }
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


// Tabela z Rejestracjami na dane wydarzenie
export const EventRegistrationTable = ({ selectedEvent}) => {
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [switchStates, setSwitchStates] = useState({});

    const fetchEventRegistrations = async () => {
        setEventRegistrations([])
        if (selectedEvent) {
            try {
                const result = await EventsService.getEventRegistrations(selectedEvent.eventId);
                if (result.success) {
                    setEventRegistrations(result.event_registrations);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania rejestracji:', error);
            }
        }
    };

    // Funkcja obsługująca zmianę przełącznika
    const handleSwitchChange = (id) => {
        const newSwitchState = !switchStates[id];

        setSwitchStates((prevState) => ({
            ...prevState,
            [id]: newSwitchState // Odwracamy stan dla danego id
        }));
        EventsService.acceptEventRegistration(id, newSwitchState).then(() => {
            console.log("Stan zaakceptowania Rezerwacji został zaktualizowany");
        })
            .catch((error) => {
                console.error('Błąd podczas aktualizacji statusu akceptacji Rezerwacji:', error);
            });
    };

    const handleDeleteEventRegistration = (id) => {
        EventsService.removeEventRegistration(id).then(
            ()=>{
                fetchEventRegistrations();
            }
        ).catch((error)=>{
            console.error('Błąd podczas usuwania rejestracji:', error);
        });
    };


// Efekt do pobrania danych na podstawie zmiany `selectedEvent`
    useEffect(() => {
        if (selectedEvent) {
            fetchEventRegistrations(); // Pobieramy rejestracje na podstawie wybranego wydarzenia
        }
    }, [selectedEvent]); // Zależność - uruchom, gdy `selectedEvent` się zmieni

// Efekt do ustawienia stanów przełączników na podstawie `eventRegistrations`
    useEffect(() => {
        if (eventRegistrations.length > 0) { // Sprawdzamy, czy mamy rejestracje
            const initialSwitchStates = {};

            eventRegistrations.forEach((er) => {
                initialSwitchStates[er.id] = er.accepted; // Ustawiamy stan na podstawie `er.accepted`
            });

            setSwitchStates(initialSwitchStates); // Ustawiamy stan przełączników
        }
    }, [eventRegistrations]); // Zależność - gdy `eventRegistrations` się zmieni



    if(eventRegistrations.length>0) {
        return (

            <Container data-bs-theme="dark">
                <h2 className="mt-5 text-white">Zapisy na wydarzenie</h2>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>L.p.</th>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Wiadomość</th>
                        <th>Zakaceptowane</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {

                        eventRegistrations.map(
                            (er, index) =>
                                <tr key={er.id}>
                                    <td>{index + 1}</td>
                                    <td>{er.user.firstName}</td>
                                    <td>{er.user.lastName}</td>
                                    <td>{er.message}</td>
                                    <td>
                                        <Form.Check
                                            type="switch"
                                            id={`custom-switch-${er.id}`}
                                            checked={switchStates[er.id]}
                                            onChange={() => handleSwitchChange(er.id)}
                                        />
                                    </td>
                                    <td><Button variant="outline-danger"
                                                onClick={() => handleDeleteEventRegistration(er.id)}>
                                        Usuń
                                    </Button></td>
                                </tr>
                        )
                    }
                    </tbody>
                </Table>
            </Container>
        );
    }else{
        return ;
    }
};