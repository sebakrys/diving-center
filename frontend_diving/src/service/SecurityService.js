import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const SECURITY_REST_URL = 'http://localhost:8080';

class SecurityService {

    initialize() {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

    async refreshToken() {
        try {
            const response = await axios.post(SECURITY_REST_URL+'/refresh-token');
            const newToken = response.data.jwt;
            const roles = response.data.roles;

            localStorage.setItem('token', newToken);
            localStorage.setItem('roles', JSON.stringify(roles));
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logoutUser();
            return false;
        }
    }


    async loginUser(email, password) {
        try {
            const response = await axios.post(SECURITY_REST_URL+'/authenticate', {
                email,
                password,
            });

            const token = response.data.jwt;
            const roles = response.data.roles;

            localStorage.setItem('token', token);
            localStorage.setItem('roles', JSON.stringify(roles)); // Przechowaj role w LocalStorage


            // Ustawienie nagłówka Authorization dla wszystkich przyszłych żądań
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


            return { success: true };
        } catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            if (error.response) {
                if (error.response.status === 401) {
                    message = 'Nieprawidłowy email lub hasło';
                } else if (error.response.data) {
                    message = error.response.data;
                }
            }
            return { success: false, message };
        }
    }

    logoutUser() {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        delete axios.defaults.headers.common['Authorization'];
    }

    async registerUser(firstName, lastName, email, password) {
        try {
            await axios.post(SECURITY_REST_URL+'/users/', {
                firstName,
                lastName,
                email,
                password,
            });
            return { success: true };
        } catch (error) {
            let message = 'Wystąpił błąd. Spróbuj ponownie.';
            if (error.response) {
                if (error.response.status === 401) {
                    message = 'Nieprawidłowy email lub hasło';
                } else if (error.response.data) {
                    message = error.response.data;
                }
            }
            return { success: false, message };
        }
    }

    isLoggedIn() {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                this.logoutUser(); // Token wygasł, wyloguj użytkownika
                return false;
            }
            return true;
        } catch (err) {
            return false; // Błąd dekodowania, traktuj token jako nieważny
        }
    }

    getCurrentUserEmail() {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            return decodedToken.sub; // Zakładamy, że ID użytkownika jest zapisane w polu 'sub' tokena
        }
        return null;
    }

    async getCurrentUserNames() {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const email = decodedToken.sub; // Zakładamy, że email użytkownika jest zapisane w polu 'sub' tokena

            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/names/' + email);
                return {success: true, userNames: response.data};
            } catch (error) {
                let message = 'Wystąpił błąd podczas pobierania danych użytkownika.';
                return {success: false, message};
            }

            return null;
        }
    }

    async getCurrentUserNamesByToken() {// To juz dziął bezpiecznie, na pdoatsiwe tokena wysłanego na serwer pobierany email usera
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/names/');
                return {success: true, userNames: response.data};
            } catch (error) {
                let message = 'Wystąpił błąd podczas pobierania danych użytkownika(byToken).';
                return {success: false, message};
            }
            return null;
        }
    }

    async getCurrentUserIdByToken() {// To juz dziął bezpiecznie, na pdoatsiwe tokena wysłanego na serwer pobierany ID usera // TODO zamiast id bedzie uuid
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/id/');
                return {success: true, userId: response.data};
            } catch (error) {
                let message = 'Wystąpił błąd podczas pobierania danych użytkownika(byToken).';
                return {success: false, message};
            }
            return null;
        }
    }

        getRoles()
        {
            const roles = localStorage.getItem('roles');
            return roles ? JSON.parse(roles) : [];
        }

// Metoda, która akceptuje tablicę ról
        isUserInRole(rolesToCheck)
        {//TODO nie trzymać ról w tokenie, to nie jest dobry pomysł, może zamienić na pobieranie
//TODO wysyłasz token JWT i w odpowiedzi dostajesz role jakie user posiada
            const userRoles = this.getRoles(); // Pobieramy role użytkownika z localStorage

            // Sprawdzamy, czy którakolwiek z ról użytkownika znajduje się w liście 'rolesToCheck'
            return userRoles.some(userRole => rolesToCheck.includes(userRole.name));
        }
    }

export default new SecurityService();