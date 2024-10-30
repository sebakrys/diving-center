import axios from 'axios';
import {jwtDecode} from "jwt-decode";
import SecurityService from "./SecurityService";

const EVENTS_REST_URL = 'http://localhost:8080';

class EventsService {

    async addEvent(name, description, startDate, endDate) {
        try {
            const response = await axios.post(EVENTS_REST_URL + '/event/', {
                name,
                description,
                startDate,
                endDate
            });
            return { event: response.data, success: true };
        }catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            return { success: false, message };
        }

    }

    async editEvent(name, description, startDate, endDate, eventId) {
        try {
            const response = await axios.put(`${EVENTS_REST_URL}/event/${eventId}`, {
                name,
                description,
                startDate,
                endDate
            });
            return { success: true };
        }catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            return { success: false, message };
        }

    }

    async deleteEvent(eventId) {
        try {
            const response = await axios.delete(`${EVENTS_REST_URL}/event/${eventId}`);
            return { success: true };
        }catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            return { success: false, message };
        }

    }

    async getEventRegistrationForUserAndEvent(userUUID, eventId) {
        try {
            const response = await axios.get(`${EVENTS_REST_URL}/event-registration/user-registration/${eventId}?userUUID=${userUUID}`);
            return { success: true, event_registration: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas pobierania rezerwacji wydarzeń. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async registerForEvent(userUUID, eventId, message) {
        console.log("getCurrentUserId: "+SecurityService.getCurrentUserUUID())
        console.log(userUUID, eventId, message)
        try {
            const response = await axios.post(`${EVENTS_REST_URL}/event-registration/`, {
                userUUID,
                eventId,
                message
            });
            return { success: true };
        } catch (error) {
            let message = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async editRegisterForEventMessage(userUUID, eventId, message) {
        console.log("getCurrentUserId: "+SecurityService.getCurrentUserUUID())
        console.log(userUUID, eventId, message)
        try {
            const response = await axios.put(`${EVENTS_REST_URL}/event-registration/`, {
                userUUID,
                eventId,
                message
            });
            return { success: true };
        } catch (error) {
            let message = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
            return { success: false, message };
        }
    }


    async getEventsForThreeMonths(month, year) {
        try {
            const response = await axios.get(`${EVENTS_REST_URL}/event/${month}/${year}`);
            return { success: true, events: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas pobierania wydarzeń. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async getEventRegistrations(eventId) {
        try {
            const response = await axios.get(`${EVENTS_REST_URL}/event-registration/event/${eventId}`);
            return { success: true, event_registrations: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas pobierania rezerwacji wydarzeń. Spróbuj ponownie.';
            return { success: false, message };
        }
    }


    async acceptEventRegistration(eventRegistrationId, accepted) {
        try {
            const response = await axios.put(`${EVENTS_REST_URL}/event-registration/${eventRegistrationId}?accepted=${accepted}`);
            return { success: true, event_registration: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas akceptacji rezerwacji. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async removeEventRegistration(eventRegistrationId) {
        try {
            const response = await axios.delete(`${EVENTS_REST_URL}/event-registration/${eventRegistrationId}`);
            return { success: true, event_registration: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas usuwania rezerwacji wydarzeń. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

}
export default new EventsService();