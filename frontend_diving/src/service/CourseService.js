import axios from 'axios';


const COURSE_REST_URL = 'http://localhost:8080';

class CourseService {

    async uploadFiles(files, type, url) {

        console.log("url: "+JSON.stringify(url))
        const formData = new FormData();

        // Dodaj wszystkie pliki do formData
        files.forEach((file) => {
            formData.append('file', file);  // Użyj 'file' jako nazwy dla plików
        });

        // Dodaj listę URL-i do formData w formacie 'url[]'
        url.forEach((u) => {
            formData.append('url[]', u);  // Zwróć uwagę na 'url[]', aby Spring poprawnie obsłużył tablicę
        });

        try {
            const response = await axios.post(`${COURSE_REST_URL}/materials/upload/` + type, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.urls; // Zwraca URL-e przesłanych plików
        } catch (error) {
            console.error("Błąd przesyłania plików:", error);
            return [];
        }
    }

}
export default new CourseService();