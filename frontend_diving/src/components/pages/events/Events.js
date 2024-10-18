import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './eventsStyles.css';
import 'moment/locale/pl';
import {
    CreateEventForm,
    DisplayBasicEventInformations,
    EditEventForm,
    EventRegistrationTable,
    RegisterForm
} from './EventsForms';
import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import EventsService from "../../../service/EventsService";
import SecurityService from "../../../service/SecurityService";

const localizer = momentLocalizer(moment);

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEvent: null,
            showCreateForm: false,
            showEditForm: false,
            showEventRegistrations: false,
            events: [],
        };
    }

    loadEvents = async (month, year) => {
        const result = await EventsService.getEventsForThreeMonths(month, year);
        if (result.success) {
            console.log(result.events)
            this.setState({
                events: result.events.map(event => ({
                    eventId: event.id,
                    description: event.description,
                    title: event.name,
                    start: new Date(event.startDate),
                    end: new Date(event.endDate),
                }))
            });
        }
    };

    componentDidMount() {
        const month = moment().month() + 1;
        const year = moment().year();
        this.loadEvents(month, year);
    }

    handleRangeChange = (range) => {
        const start = moment(range.start);
        const end = moment(range.end);

        // Oblicz środkowy punkt pomiędzy start i end
        const middle = moment(start).add(end.diff(start, 'days') / 2, 'days');

        const month = middle.month() + 1;
        const year = middle.year();
        this.loadEvents(month, year);
    };

    handleSelected = (event) => {
        this.setState({ selectedEvent: event });
        console.info('[handleSelected - event]', event);
    };

    handleAddEvent = (newEvent) => {
        this.setState((prevState) => ({
            events: [...prevState.events, newEvent],
            showCreateForm: false,
            selectedEvent: newEvent
        }));
    };

    handleEditEvent = (editedEvent) => {
        this.setState((prevState) => ({
            events: prevState.events.map(event =>
                event.eventId === editedEvent.eventId ? editedEvent : event
            ),
            showEditForm: false,
            selectedEvent: null
        }));
    };

    handleDeleteEvent = (deletedEvent) => {
        this.setState((prevState) => ({
            events: prevState.events.filter(event => event.eventId !== deletedEvent.eventId),
            selectedEvent: null,
            showEditForm: false
        }));
    };

    toggleCreateForm = () => {
        this.setState((prevState) => ({ showCreateForm: !prevState.showCreateForm }));
    };

    toggleEditForm = () => {
        this.setState((prevState) => ({ showEditForm: !prevState.showEditForm }));
    };

    // Funkcja do dostosowania stylu wybranego wydarzenia
    eventStyleGetter = (event) => {
        const isSelected = this.state.selectedEvent && this.state.selectedEvent.title === event.title;
        const style = {
            backgroundColor: isSelected ? '#B658FC' : '#3174ad',
            color: 'white',
            borderRadius: '5px',
            opacity: 0.8,
            border: '0px',
            display: 'block'
        };
        return {
            style: style,
        };
    };

    render() {
        return (
            <Container style={{
                height: "100vh",
            }}>
                <div style={{ height: 500 }}>
                    <Calendar
                        localizer={localizer}
                        events={this.state.events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={this.handleSelected}
                        eventPropGetter={this.eventStyleGetter}
                        culture='pl'
                        style={{ height: '100%', margin: '5%' }}
                        onRangeChange={this.handleRangeChange}
                        messages={{
                            next: "Nast.",
                            previous: "Poprz.",
                            today: "Dziś",
                            month: "Miesiąc",
                            week: "Tydzień",
                            day: "Dzień",
                            agenda: "Agenda"
                        }}
                    />
                </div>

                <div className="d-flex flex-wrap justify-content-center mt-4">
                    {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                        <div className="d-flex mb-3">
                            <Button
                                variant="outline-success"
                                onClick={this.toggleCreateForm}
                                className="me-2"
                            >
                                Utwórz nowe wydarzenie
                            </Button>

                            {this.state.selectedEvent && (
                                <>
                                    <Button
                                        variant="outline-primary"
                                        onClick={this.toggleEditForm}
                                    >
                                        Edytuj wydarzenie
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Modal tworzenia nowego wydarzenia */}
                    <Modal show={this.state.showCreateForm} onHide={this.toggleCreateForm} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Utwórz nowe wydarzenie</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <CreateEventForm
                                onAddEvent={this.handleAddEvent}
                                onCancel={this.toggleCreateForm}
                            />
                        </Modal.Body>
                    </Modal>

                    {/* Modal edycji wydarzenia */}
                    <Modal show={this.state.showEditForm} onHide={this.toggleEditForm} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Edytuj wydarzenie</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <EditEventForm
                                onEditEvent={this.handleEditEvent}
                                onDeleteEvent={this.handleDeleteEvent}
                                onCancel={this.toggleEditForm}
                                selectedEvent={this.state.selectedEvent}
                            />
                        </Modal.Body>
                    </Modal>
                    {(SecurityService.getRoles().length===0 && this.state.selectedEvent) && (

                            <DisplayBasicEventInformations
                                event={this.state.selectedEvent}
                            />

                    )}

                    {(SecurityService.isUserInRole(["ROLE_CLIENT"]) && this.state.selectedEvent) && (
                        <RegisterForm
                            event={this.state.selectedEvent}
                            onCancel={() => this.setState({ selectedEvent: null })}
                        />
                    )}

                    {(SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && this.state.selectedEvent) && (
                        <div className="p-2" style={{ flex: '1 0 600px', maxWidth: '1200px' }}>
                            <EventRegistrationTable
                                selectedEvent={this.state.selectedEvent}
                            />
                        </div>
                    )}
                </div>
            </Container>
        );
    }
}

export default Events;
