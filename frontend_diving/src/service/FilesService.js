import axios from 'axios';
import CONFIG from "../config";

const FILES_REST_URL = CONFIG.REST_URL;

class FilesService {

    // Metoda do pobierania plików (stron lub obrazów)
    async getFiles(type) {
        try {
            const response = await axios.get(`${FILES_REST_URL}/files/all-${type === 'page' ? 'pages' : 'images'}`);
            return response.data;
        } catch (error) {
            console.error("Błąd przy pobieraniu plików:", error);
            return { pages: [], images: [] };
        }
    }

    // Metoda do przesyłania pliku
    async uploadFile(file, type, filename) {
        const formData = new FormData();
        formData.append(type === "page" ? 'page' : 'image', file);
        formData.append('filename', filename);

        try {
            const response = await axios.post(`${FILES_REST_URL}/files/upload-${type}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.url;
        } catch (error) {
            console.error("Błąd przy przesyłaniu pliku:", error);
            return null;
        }
    }
}

export default new FilesService();
