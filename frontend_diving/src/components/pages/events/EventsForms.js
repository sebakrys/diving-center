import React, { useState } from 'react';
import moment from 'moment';
import {Button} from "react-bootstrap";
import Form from 'react-bootstrap/Form';

// Formularz do tworzenia nowego wydarzenia
export const CreateEventForm = ({ onAddEvent, onCancel }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newEvent = {
            title,
            start: new Date(start),
            end: new Date(end),
        };
        onAddEvent(newEvent);
    };

    return (
        <div className="form-container" style={{
            color: '#fff'
        }}>
            <h3>Create New Event</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Start Date:</label>
                    <Form.Control
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>End Date:</label>
                    <Form.Control
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit">Add Event</Button>
                <Button type="button" onClick={onCancel}>
                    Cancel
                </Button>
            </form>
        </div>
    );
};

// Formularz do zapisywania się na wydarzenie
export const RegisterForm = ({ event, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registered for event:', event.title, 'Name:', name, 'Email:', email);
        onCancel(); // Zamknij formularz po rejestracji
    };

    return (
        <div className="form-container" style={{
            color: '#fff'
        }}>
            <h3>Register for {event.title}</h3>
            <p>
                Start: {moment(event.start).format('LLL')} <br />
                End: {moment(event.end).format('LLL')}
            </p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit">Register</Button>
                <Button type="button" onClick={onCancel}>
                    Cancel
                </Button>
            </form>
        </div>
    );
};
