import axios from 'axios';
const SECURITY_REST_URL = 'http://localhost:8080/';

class SecurityService{
    login = async (email, password) => {
        try {
            const response = await axios.post(SECURITY_REST_URL+'/authenticate', {
                email: email,
                password: password
            });

            const token = response.data.jwt;
            // Przechowaj token w localStorage lub w stanie aplikacji
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Możesz przekierować użytkownika lub zaktualizować stan aplikacji
        } catch (error) {
            console.error('Błąd podczas logowania', error);
            // Obsłuż błąd, np. wyświetl komunikat użytkownikowi
        }
    };

    logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        // Zresetuj stan aplikacji, np. wyczyść dane użytkownika
    };
}
export default new SecurityService();
