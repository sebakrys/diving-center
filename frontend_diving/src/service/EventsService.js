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
            return { success: true };
        }catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            return { success: false, message };
        }

    }


    async registerForEvent(userEmail, eventId, message) {
        console.log("getCurrentUserId: "+SecurityService.getCurrentUserEmail())
        console.log(userEmail, eventId, message)
        try {
            const response = await axios.post(`${EVENTS_REST_URL}/event-registration/`, {
                userEmail,
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

}
export default new EventsService();