import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const SECURITY_REST_URL = 'http://localhost:8080';

class SecurityService {
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

    getRoles() {
        const roles = localStorage.getItem('roles');
        return roles ? JSON.parse(roles) : [];
    }

    isUserInRole(role) {
        const roles = this.getRoles();
        return roles.some(r => r.name === role);
    }
}

export default new SecurityService();