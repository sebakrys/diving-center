import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import FilesService from "../../../service/FilesService";
import CONFIG from "../../../config";

const FILES_REST_URL = CONFIG.REST_URL;

const FilesPage = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedPageFile, setSelectedPageFile] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const [pageFileName, setPageFileName] = useState('');

    // Funkcja pobierająca pliki przy ładowaniu strony
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const pageFilesResponse = await FilesService.getFiles('page');
                setPages(pageFilesResponse.pages);

                const imageFilesResponse = await FilesService.getFiles('image');
                setImages(imageFilesResponse.images);
            } catch (error) {
                console.error("Błąd przy pobieraniu plików:", error);
            }
        };

        fetchFiles();
    }, []);

    // Funkcja obsługująca przesyłanie plików
    const handleFileUpload = async (type, filename) => {
        let file;

        if (type === "page") {
            file = selectedPageFile;
        } else if (type === "image") {
            file = selectedImageFile;
        }

        if (!file) {
            console.error("Nie wybrano pliku.");
            return;
        }

        setIsUploading(true);

        try {
            const uploadedUrl = await FilesService.uploadFile(file, type, filename);

            if (type === "page") {
                setPages((prevPages) => [...prevPages, uploadedUrl]);
            } else if (type === "image") {
                setImages((prevImages) => [...prevImages, uploadedUrl]);
            }

            console.log("Plik przesłany: ", uploadedUrl);
        } catch (error) {
            console.error("Błąd przy przesyłaniu pliku:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Container data-bs-theme="dark">
            <h2>Wszystkie pliki</h2>
            <Row>
                {/* Kolumna dla obrazów */}
                <Col md={6}>
                    <h3>Obrazy</h3>
                    <div className="mb-3">
                        <h5>Prześlij nowy obraz</h5>
                        <Form>
                            <Form.Group controlId="formImageUpload">
                                <Form.Control
                                    type="file"
                                    onChange={(e) => {
                                        setSelectedImageFile(e.target.files[0]);
                                        setImageFileName(e.target.files[0]?.name || '');
                                    }}
                                />
                            </Form.Group>
                            <Form.Group controlId="formImageFileName">
                                <Form.Control
                                    type="text"
                                    value={imageFileName}
                                    placeholder="Wpisz nazwę pliku"
                                    onChange={(e) => setImageFileName(e.target.value)}
                                />
                            </Form.Group>
                            <Button
                                variant="primary"
                                onClick={() => handleFileUpload("image", imageFileName)}
                                disabled={isUploading || !selectedImageFile}
                            >
                                {isUploading ? 'Przesyłanie...' : 'Prześlij'}
                            </Button>
                        </Form>
                    </div>
                    <div>
                        <h5>Przesłane obrazy</h5>
                        {images.length > 0 ? (
                            <div className="d-flex flex-wrap">
                                {images.map((image, index) => (
                                    <Card key={index} className="m-2" style={{ width: '18rem' }}>
                                        <Card.Img variant="top" src={FILES_REST_URL+image} />
                                        <Card.Body>
                                            <Card.Text>Obraz nr {index + 1}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p>Brak przesłanych obrazów</p>
                        )}
                    </div>
                </Col>

                {/* Kolumna dla plików stron */}
                <Col md={6}>
                    <h3>Strony</h3>
                    <div className="mb-3">
                        <h5>Prześlij nowy plik strony</h5>
                        <Form>
                            <Form.Group controlId="formPageUpload">
                                <Form.Control
                                    type="file"
                                    onChange={(e) => {
                                        setSelectedPageFile(e.target.files[0]);
                                        setPageFileName(e.target.files[0]?.name || '');
                                    }}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPageFileName">
                                <Form.Control
                                    type="text"
                                    value={pageFileName}
                                    placeholder="Wpisz nazwę pliku"
                                    onChange={(e) => setPageFileName(e.target.value)}
                                />
                            </Form.Group>
                            <Button
                                variant="primary"
                                onClick={() => handleFileUpload("page", pageFileName)}
                                disabled={isUploading || !selectedPageFile}
                            >
                                {isUploading ? 'Przesyłanie...' : 'Prześlij'}
                            </Button>

                        </Form>
                    </div>
                    <div>
                        <h5>Przesłane strony</h5>
                        {pages.length > 0 ? (
                            <div className="d-flex flex-wrap">
                                {pages.map((page, index) => (
                                    <Card key={index} className="m-2" style={{ width: '18rem' }}>
                                        <Card.Body>
                                            <Card.Text>Strona nr {index + 1}</Card.Text>
                                            <a href={FILES_REST_URL+page} target="_blank" rel="noopener noreferrer">
                                                Otwórz stronę
                                            </a>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p>Brak przesłanych plików stron</p>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default FilesPage;
