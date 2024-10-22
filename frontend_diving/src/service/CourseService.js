import axios from 'axios';


const COURSE_REST_URL = 'http://localhost:8080';

class CourseService {

    async uploadFiles(files, type) {
        const formData = new FormData();

        // Dodaj wszystkie pliki do pola 'image[]'
        files.forEach((file) => {
            formData.append('file', file);  // Użyj jednej nazwy dla wszystkich plików
        });

        try {
            const response = await axios.post(`${COURSE_REST_URL}/materials/upload/`+type, formData, {
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