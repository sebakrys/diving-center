import axios from 'axios';
import {jwtDecode} from "jwt-decode";
import CONFIG from "../config";

const SECURITY_REST_URL = CONFIG.REST_URL;
//const SECURITY_REST_URL = 'http://localhost:8080';

class SecurityService {


    constructor() {
        this.cachedRoles = null;
    }

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

            await this.reloadRoles();
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
            await this.reloadRoles();
            return { success: false, message };
        }
    }

    async logoutUser() {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        await this.reloadRoles();
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

    getCurrentUserUUID() {
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

    async getCurrentUserUUIdByToken() {// To juz dziął bezpiecznie, na pdoatsiwe tokena wysłanego na serwer pobierany uuID usera
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/uuid/');
                return {success: true, userId: response.data};
            } catch (error) {
                let message = 'Wystąpił błąd podczas pobierania danych użytkownika(byToken).';
                return {success: false, message};
            }
            return null;
        }
    }


    async reloadRoles() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/roles/');
                const roles = response.data;

                //console.log("Otrzymane role:", roles);
                this.cachedRoles = roles || []; // Buforuj role
                return this.cachedRoles;
            } catch (error) {
                console.error('Wystąpił błąd podczas pobierania danych użytkownika(byToken):', error);
                this.cachedRoles = [];
                return this.cachedRoles;
            }
        }
        this.cachedRoles = [];
        return this.cachedRoles;
    }

    async loadRoles() {
        // Jeśli role są już zbuforowane, zwróć je
        if (this.cachedRoles) {
            return this.cachedRoles;
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(SECURITY_REST_URL + '/users/roles/');
                const roles = response.data;

                //console.log("Otrzymane role:", roles);
                this.cachedRoles = roles || []; // Buforuj role
                return this.cachedRoles;
            } catch (error) {
                console.error('Wystąpił błąd podczas pobierania danych użytkownika(byToken):', error);
                this.cachedRoles = [];
                return this.cachedRoles;
            }
        }
        this.cachedRoles = [];
        return this.cachedRoles;
    }

    // Synchroniczna metoda pobierająca role z bufora
    getCachedRoles() {
        return this.cachedRoles || [];
    }

    // Synchroniczna metoda sprawdzająca role
    isUserInRole(rolesToCheck) {

        let userRoles = this.getCachedRoles()

        this.reloadRoles().then(() => {

            userRoles = this.getCachedRoles()
        }).catch((error) => {
            console.error('Wystąpił błąd podczas sprawdzania ról użytkownika:', error);
            userRoles = this.getCachedRoles()
        });



        //console.log("Role użytkownika:", userRoles);
        //console.log("Sprawdzane role:", rolesToCheck);

        // Sprawdzamy, czy którakolwiek z ról użytkownika znajduje się w liście 'rolesToCheck'
        const result = userRoles.some(userRole => rolesToCheck.includes(userRole));
        //console.log("Czy użytkownik ma przynajmniej jedną z ról?", result);

        return result;
    }

    }

export default new SecurityService();