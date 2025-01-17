import axios from "axios";
import SecurityService from "./SecurityService";
import CONFIG from "../config";

const BLOG_REST_URL = CONFIG.REST_URL;
//const BLOG_REST_URL = 'http://localhost:8080';

//const BLOG_REST_URL = 'http://10.0.2.2:8080'//Android emulator

class BlogService {
    async createPostWithImages(postData) {
        try {
            const response = await axios.post(`${BLOG_REST_URL}/blog/`, postData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Błąd podczas tworzenia posta:", error);
            return { success: false, error: error.message };
        }
    }

    async uploadFiles(files) {
        const formData = new FormData();

        // Dodaj wszystkie pliki do pola 'image[]'
        files.forEach((file) => {
            formData.append('image', file);  // Użyj jednej nazwy dla wszystkich plików
        });

        try {
            const response = await axios.post(`${BLOG_REST_URL}/blog/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.urls; // Zwraca URL-e przesłanych zdjęć
        } catch (error) {
            console.error("Błąd przesyłania zdjęć:", error);
            return [];
        }
    }

    async getAllPosts() {
        try {
            const response = await axios.get(`${BLOG_REST_URL}/blog/post`);
            return response.data; // Zwracamy dane postów
        } catch (error) {
            console.error("Błąd podczas pobierania postów:", error);
            return [];
        }
    }

    async editPost(postId, updatedPost) {

        try {
            const response = await axios.put(`${BLOG_REST_URL}/blog/${postId}`, updatedPost);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Błąd podczas edycji posta:", error);
            return { success: false, error: error.message };
        }
    }

    async deletePost(postId, updatedPost) {

        try {
            const response = await axios.delete(`${BLOG_REST_URL}/blog/${postId}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Błąd podczas usuwania posta:", error);
            return { success: false, error: error.message };
        }
    }
}

export default new BlogService();
