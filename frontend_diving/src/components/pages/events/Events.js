import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './eventsStyles.css';
import 'moment/locale/pl';
import { CreateEventForm, RegisterForm } from './EventsForms';
import {Button} from "react-bootstrap";

const localizer = momentLocalizer(moment);

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEvent: null,
            showCreateForm: false,
            events: [
                {
                    title: 'Sample Event1',
                    start: new Date(moment().add(-3, 'days').toDate()),
                    end: new Date(moment().add(3, 'days').add(1, 'hour').toDate()),
                },
                {
                    title: 'Sample Event2',
                    start: new Date(),
                    end: new Date(moment().add(1, 'hour').toDate()),
                },
            ],
        };
    }

    handleSelected = (event) => {
        this.setState({ selectedEvent: event });
        console.info('[handleSelected - event]', event);
    };

    handleAddEvent = (newEvent) => {
        this.setState((prevState) => ({
            events: [...prevState.events, newEvent],
            showCreateForm: false,
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
            <div>
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
                <Button onClick={this.toggleCreateForm} style={{ marginBottom: '10px' }}>
                    Create New Event
                </Button>
                {this.state.showCreateForm && (
                    <CreateEventForm
                        onAddEvent={this.handleAddEvent}
                        onCancel={this.toggleCreateForm}

                    />
                )}
                {this.state.selectedEvent && (
                    <RegisterForm
                        event={this.state.selectedEvent}
                        onCancel={() => this.setState({ selectedEvent: null })}
                    />
                )}
            </div>
        );
    }
}

export default Events;
