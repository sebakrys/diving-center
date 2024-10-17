import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './eventsStyles.css';
import 'moment/locale/pl';
import { CreateEventForm, EditEventForm, EventRegistrationTable, RegisterForm } from './EventsForms';
import { Button, Container } from "react-bootstrap";
import EventsService from "../../../service/EventsService";
import SecurityService from "../../../service/SecurityService";

const localizer = momentLocalizer(moment);

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEvent: null,
            showCreateForm: false,
            showEditEventForm: false,
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
        }));
    };

    handleDeleteEvent = (deletedEvent) => {
        this.setState((prevState) => ({
            events: prevState.events.filter(event => event.eventId !== deletedEvent.eventId),
            selectedEvent: null
        }));
    };

    toggleCreateForm = () => {
        this.setState((prevState) => ({ showCreateForm: !prevState.showCreateForm }));
    };

    // Funkcja do dostosowania stylu wybranego wydarzenia
    eventStyleGetter = (event) => {
        const isSelected = this.state.selectedEvent && this.state.selectedEvent.title === event.title;
        const style = {
            backgroundColor: isSelected ? '#265985' : '#3174ad',
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
            <Container>
                <div style={{ height: 500, opacity: "90%" }}>
                    <Calendar
                        localizer={localizer}
                        events={this.state.events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={this.handleSelected}
                        eventPropGetter={this.eventStyleGetter}
                        culture='pl'
                        style={{ height: '100%', margin: '5%', background: '#F0F0FF' }}
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
                        <div className="p-2" style={{ flex: '1 1 600px', maxWidth: '800px' }}>
                            <Button variant="outline-success" onClick={this.toggleCreateForm} style={{ marginBottom: '10px' }}>
                                Utwórz nowe wydarzenie
                            </Button>
                            {this.state.showCreateForm && (
                                <CreateEventForm
                                    onAddEvent={this.handleAddEvent}
                                    onCancel={this.toggleCreateForm}
                                />
                            )}
                        </div>
                    )}

                    {(SecurityService.isUserInRole(["ROLE_CLIENT"]) && this.state.selectedEvent) && (
                        <div className="p-2" style={{ flex: '1 1 600px', maxWidth: '800px' }}>
                            <RegisterForm
                                event={this.state.selectedEvent}
                                onCancel={() => this.setState({ selectedEvent: null })}
                            />
                        </div>
                    )}

                    {(SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && this.state.selectedEvent) && (
                        <div className="p-2" style={{ flex: '1 1 600px', maxWidth: '800px' }}>
                            <EditEventForm
                                onEditEvent={this.handleEditEvent}
                                onDeleteEvent={this.handleDeleteEvent}
                                onCancel={() => this.setState({ selectedEvent: null })}
                                selectedEvent={this.state.selectedEvent}
                            />
                        </div>
                    )/*TODO Ustawić sensowie (LAYOUT) formularze*/}

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
