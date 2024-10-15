import React, { useState } from "react";
import { Button, Container, Form, Row, Col, Spinner } from "react-bootstrap";
import BlogService from "../../../service/BlogService";

export const CreateBlogPostForm = ({ blog }) => {
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [uploadedImagesUrls, setUploadedImagesUrls] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        // Generowanie podglądu obrazów
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);

        // Zablokuj przycisk "Zapisz post" podczas przesyłania zdjęć
        setIsUploading(true);

        // Wyślij pliki na serwer
        const uploadedUrls = await BlogService.uploadFiles(files);

        // Zaktualizuj adresy URL zdjęć
        setUploadedImagesUrls(uploadedUrls);

        // Odblokuj przycisk "Zapisz post" po zakończeniu przesyłania
        setIsUploading(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Tworzenie obiektu form-data do przesyłania danych wraz z URL-ami obrazów
        const formData = {
            title: postTitle,
            content: postContent,
            images: uploadedImagesUrls, // Adresy URL przesłanych obrazów
        };

        // Wysyłanie posta do serwera
        const response = await BlogService.createPostWithImages(formData);

        if (response.success) {
            console.log("Post utworzony pomyślnie");
            setPostTitle("");
            setPostContent("");
            setPreviewImages([]);
            setUploadedImagesUrls([]);
        }
    };

    return (
        <Container data-bs-theme="dark">
            <h2 className="mt-5 text-white">Tworzenie nowego posta</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="postTitle" className="mb-3">
                    <Form.Label className="mt-3 text-white h4">Tytuł posta</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Wprowadź tytuł"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="postContent" className="mb-3">
                    <Form.Label className="mt-3 text-white h4">Treść posta</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Wprowadź treść posta"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="postImages" className="mb-3">
                    <Form.Label className="mt-3 text-white h4">Dodaj zdjęcia</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isUploading} // Zablokuj, gdy obrazy są przesyłane
                    />
                </Form.Group>

                {isUploading && <Spinner animation="border" role="status"><span className="sr-only text-white h4"></span></Spinner>}

                {/* Podgląd obrazów */}
                {previewImages.length > 0 && (
                    <Row className="mb-3">
                        <Col>
                            <h5 className="mt-3 text-white">Podgląd zdjęć</h5>
                            <div className="d-flex">
                                {previewImages.map((src, index) => (
                                    <img
                                        key={index}
                                        src={src}
                                        alt={`preview_${index}`}
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            marginRight: "10px",
                                        }}
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                )}

                <Button type="submit" variant="primary" disabled={isUploading || !uploadedImagesUrls.length}>
                    Zapisz post
                </Button>
            </Form>
        </Container>
    );
};
