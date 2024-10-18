import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import SecurityService from "./SecurityService";

function redirectToLogin() {
    window.location.href = '/#/login';
}

axios.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const tokenExpirationTime = decodedToken.exp;

            // Odśwież token, jeśli został mniej niż 1 minuta do wygaśnięcia
            if (tokenExpirationTime - currentTime < 60) {
                const refreshed = await SecurityService.refreshToken();
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                } else {
                    // Jeśli odświeżenie się nie powiodło, wyloguj użytkownika
                    SecurityService.logoutUser();
                    redirectToLogin();
                    return Promise.reject('Token refresh failed');
                }
            } else {
                // Upewnij się, że nagłówek Authorization jest ustawiony
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
