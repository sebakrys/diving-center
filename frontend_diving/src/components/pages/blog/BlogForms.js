import React, {useEffect, useState} from "react";
import {Button, Container, Form, Row, Col, Spinner, Card} from "react-bootstrap";
import { Modal, Carousel } from 'react-bootstrap';
import BlogService from "../../../service/BlogService";
import SecurityService from "../../../service/SecurityService";

export const CreateBlogPostForm = ({ fetchPosts }) => {
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
            email: SecurityService.getCurrentUserEmail(),
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

            fetchPosts();
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
                        maxLength={255}
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
                        maxLength={3500}
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

                <Button type="submit" variant="primary" disabled={isUploading}>
                    Zapisz post
                </Button>
            </Form>
        </Container>
    );
};

const IMAGE_REST_URL = 'http://localhost:8080';

export const BlogPostsList = ({posts}) => {
    const [showCarousel, setShowCarousel] = useState(false);
    const [showMoreStates, setShowMoreStates] = useState({});
    const [currentImages, setCurrentImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);


    // Funkcja obsługująca kliknięcie w miniaturkę
    const handleThumbnailClick = (images, index) => {
        setCurrentImages(images);
        setCurrentIndex(index);
        setShowCarousel(true);
    };

    // Funkcja zamykająca modal z karuzelą
    const handleCloseCarousel = () => {
        setShowCarousel(false);
        setCurrentImages([]);
        setCurrentIndex(0);
    };

    const handleShowMore = (postId) => {
        setShowMoreStates((prevStates) => ({
            ...prevStates,
            [postId]: true,
        }));
    };

    return (
        <Container className="mt-1">
            {posts.map((post) => (
                <Card key={post.id} className="mb-4 bg-dark text-white" style={{ opacity: "90%" }}>
                    <Card.Body>
                        <Card.Title className="mb-3">{post.title}</Card.Title>
                        <Card.Subtitle className="mb-4 text-white">
                            {new Date(post.publishDate).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}{' '}
                            | {post.author.firstName} {post.author.lastName}
                        </Card.Subtitle>
                        <Card.Text>
                            {(post.content.length > 200 && !showMoreStates[post.id])
                                ? `${post.content.substring(0, 200)}...`
                                : post.content}
                        </Card.Text>
                        {/* Przycisk "Czytaj więcej" */}
                        {!showMoreStates[post.id] &&
                            <Button variant="outline-light" className="mt-2" onClick={() => {
                                handleShowMore(post.id)
                            }}>
                                Czytaj więcej
                            </Button>
                        }
                        {/* Wyświetlenie miniaturek obrazków */}
                        <div className="d-flex flex-wrap mt-2">
                            {post.images &&
                                post.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={`${IMAGE_REST_URL}${image.thumbnail_url}`}
                                        alt={`thumb_${index}`}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            marginRight: '5px',
                                            marginBottom: '5px',
                                            cursor: 'pointer',
                                            borderRadius: '5px',
                                        }}
                                        onClick={() => handleThumbnailClick(post.images, index)}
                                    />
                                ))}
                        </div>
                    </Card.Body>
                </Card>
            ))}

            {/* Modal z karuzelą */}
            <Modal
                show={showCarousel}
                onHide={handleCloseCarousel}
                centered
                size="lg"
            >
                <Modal.Body className="p-0 bg-dark">
                    <Carousel
                        activeIndex={currentIndex}
                        onSelect={(selectedIndex) => setCurrentIndex(selectedIndex)}
                        interval={null}
                        indicators={false}
                        nextIcon={
                            <span
                                aria-hidden="true"
                                className="carousel-control-next-icon"
                            />
                        }
                        prevIcon={
                            <span
                                aria-hidden="true"
                                className="carousel-control-prev-icon"
                            />
                        }
                    >
                        {currentImages.map((image, index) => (
                            <Carousel.Item key={index}>
                                <img
                                    className="d-block w-100"
                                    src={`${IMAGE_REST_URL}${image.url}`}
                                    alt={`image_${index}`}
                                    style={{ maxHeight: '80vh', objectFit: 'contain' }}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <Button
                        variant="link"
                        onClick={handleCloseCarousel}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            color: '#fff',
                            fontSize: '2rem',
                            textDecoration: 'none',
                            zIndex: 1000,
                        }}
                    >
                        &times;
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

