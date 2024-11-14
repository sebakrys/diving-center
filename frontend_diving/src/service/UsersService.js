import axios from "axios";
import CONFIG from "../config";

const USERS_REST_URL = CONFIG.REST_URL;
//const USERS_REST_URL = 'http://localhost:8080';

class UsersService {


    // Wysyła link resetowania hasła na e-mail
    async requestPasswordReset(email) {
        try {
            const response = await axios.post(`${USERS_REST_URL}/users/password-reset/request`, null, {
                params: { email }
            });
            return { success: true, message: response.data };
        } catch (error) {
            console.error("Błąd podczas żądania resetu hasła:", error);
            return { success: false, error: error.response?.data || "Nieznany błąd" };
        }
    }

    // Zmienia hasło na podstawie tokena
    async resetPassword(token, newPassword) {
        try {
            const response = await axios.post(`${USERS_REST_URL}/users/password-reset`, null, {
                params: { token, newPassword }
            });
            return { success: true, message: response.data };
        } catch (error) {
            console.error("Błąd podczas resetowania hasła:", error);
            return { success: false, error: error.response?.data || "Nieznany błąd" };
        }
    }

    // Aktywuje użytkownika na podstawie tokena
    async activateUser(token) {
        try {
            const response = await axios.put(`${USERS_REST_URL}/users/activate`, null, {
                params: { token }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Błąd podczas aktywacji użytkownika:", error);
            return { success: false, error: error.response?.data || "Nieznany błąd" };
        }
    }


    async getAllUsers() {
        try {
            const response = await axios.get(`${USERS_REST_URL}/users/roles`);
            return { success: true, users: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas pobierania Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async getAllRoles() {
        try {
            const response = await axios.get(`${USERS_REST_URL}/roles/`);
            return { success: true, roles: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas pobierania Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async removeRoleFromUser(userId, roleName) {
        try {
            const response = await axios.delete(`${USERS_REST_URL}/users/`+userId+"/roles/"+roleName);
            return { success: true, users: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas aktywacji Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async assignRoleToUser(userId, roleName) {
        try {
            const response = await axios.put(`${USERS_REST_URL}/users/`+userId+"/roles/"+roleName);
            return { success: true, users: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas aktywacji Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }


    async setActiveUser(userId, active) {
        try {
            const response = await axios.put(`${USERS_REST_URL}/users/`+userId+"/activ/"+active);
            return { success: true, users: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas aktywacji Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

    async setNonBlockedUser(userId, nonblock) {
        try {
            const response = await axios.put(`${USERS_REST_URL}/users/`+userId+"/nonblock/"+nonblock);
            return { success: true, users: response.data };
        } catch (error) {
            let message = 'Wystąpił błąd podczas odblokowywania Użytkowników. Spróbuj ponownie.';
            return { success: false, message };
        }
    }

}
export default new UsersService();