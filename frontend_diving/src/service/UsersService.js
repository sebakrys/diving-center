import axios from "axios";

const USERS_REST_URL = 'http://localhost:8080';

class UsersService {

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