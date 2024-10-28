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

    // Funkcja obsługująca aktualizację obrazów podczas edycji
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        // Generowanie podglądu obrazów
        const previews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages((prevPreviews) => [...prevPreviews, ...previews]);

        // Zablokuj przycisk "Zapisz zmiany" podczas przesyłania zdjęć
        setIsUploading(true);

        // Wyślij pliki na serwer
        const uploadedUrls = await BlogService.uploadFiles(files);


        // Przekształć tablicę łańcuchów w tablicę obiektów z kluczem 'url'
        //const uploadedImages = uploadedUrls.map((url) => ({ url }));

        console.log(JSON.stringify(uploadedUrls))
        // Zaktualizuj adresy URL zdjęć
        setUploadedImagesUrls((prevImages) => [...prevImages, ...uploadedUrls]);

        // Odblokuj przycisk "Zapisz zmiany" po zakończeniu przesyłania
        setIsUploading(false);
    };

    const handleRemoveImage = (index) => {
        setUploadedImagesUrls((prevImages) => prevImages.filter((_, i) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
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

        console.log(JSON.stringify(formData))

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
                    />{/*TODO wiem że dla niektórych formatów nie zadziała przesyłanie, możliwe że problem po stronie backendu, może z przetwarzaniem na miniaturkę*/}
                </Form.Group>{/*TODO sprawdzić dla jakich formatów zdjęć nie działa*/}

                {isUploading && <Spinner animation="border" role="status"><span className="sr-only text-white h4"></span></Spinner>}

                {/* Podgląd obrazów */}
                {/* Podgląd obrazów */}
                {previewImages.length > 0 && (
                    <Row className="mb-3">
                        <Col>
                            <h5>Podgląd zdjęć</h5>
                            <div className="d-flex flex-wrap">
                                {previewImages.map((src, index) => (
                                    <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                                        <img
                                            src={src}
                                            alt={`preview_${index}`}
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        {!isUploading &&
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            style={{ position: 'absolute', top: '0', right: '0' }}
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            &times;
                                        </Button>
                                        }
                                    </div>
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

//TODO (MODAL) ustal jedną wspolną wysokośc zdjec aby nie skakało podaczas przewijania jesli proporcje sa rozne

const IMAGE_REST_URL = 'http://localhost:8080';

export const BlogPostsList = ({ posts, fetchPosts }) => {
    const [showCarousel, setShowCarousel] = useState(false);
    const [showMoreStates, setShowMoreStates] = useState({});
    const [currentImages, setCurrentImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [editedImages, setEditedImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

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

    // Funkcja obsługująca "Czytaj więcej"
    const handleShowMore = (postId) => {
        setShowMoreStates((prevStates) => ({
            ...prevStates,
            [postId]: true,
        }));
    };

    // Funkcja obsługująca usuwanie posta
    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć tego posta?");
        if (confirmed) {
            await BlogService.deletePost(postId);
            fetchPosts(); // Odśwież listę postów po usunięciu
        }
    };

    // Funkcja otwierająca modal edycji
    const handleEditPost = (post) => {
        setSelectedPost(post);
        setEditedTitle(post.title);
        setEditedContent(post.content);
        setEditedImages(post.images || []);
        setPreviewImages(post.images.map((image) => `${IMAGE_REST_URL}${image.thumbnail_url}`));
        setShowEditModal(true);
    };

    // Funkcja obsługująca aktualizację obrazów podczas edycji
    const handleEditFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        // Generowanie podglądu obrazów
        const previews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages((prevPreviews) => [...prevPreviews, ...previews]);

        // Zablokuj przycisk "Zapisz zmiany" podczas przesyłania zdjęć
        setIsUploading(true);

        // Wyślij pliki na serwer
        const uploadedUrls = await BlogService.uploadFiles(files);


        // Przekształć tablicę łańcuchów w tablicę obiektów z kluczem 'url'
        const uploadedImages = uploadedUrls.map((url) => ({ url }));
        // Zaktualizuj adresy URL zdjęć
        setEditedImages((prevImages) => [...prevImages, ...uploadedImages]);

        // Odblokuj przycisk "Zapisz zmiany" po zakończeniu przesyłania
        setIsUploading(false);
    };

    // Funkcja obsługująca usuwanie obrazka podczas edycji
    const handleRemoveImage = (index) => {
        setEditedImages((prevImages) => prevImages.filter((_, i) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    // Funkcja obsługująca zapisanie edytowanego posta
    const handleEditSubmit = async (event) => {
        event.preventDefault();



        const updatedPost = {
            title: editedTitle,
            email: SecurityService.getCurrentUserEmail(),
            content: editedContent,
            images: editedImages.map(image => image.url), // Adresy URL przesłanych obrazów
        };

        console.log((JSON.stringify(editedImages)))
        console.log(JSON.stringify(updatedPost))


        await BlogService.editPost(selectedPost.id, updatedPost);
        setShowEditModal(false);
        setSelectedPost(null);
        fetchPosts(); // Odśwież listę postów po edycji
    };

    return (
        <Container className="mt-1">
            {posts.map((post) => (
                <Card
                    key={post.id}
                    className="mt-5 mb-4 bg-dark text-white"
                    style={{
                        opacity: "90%",
                        borderRadius: "15px",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Card.Body>
                        {/* Górna sekcja: data, tytuł, autor */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {/* Data po lewej */}
                            <div>
                                <Card.Subtitle className="text-secondary">
                                    {new Date(post.publishDate).toLocaleDateString('pl-PL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Card.Subtitle>
                            </div>
                            {/* Tytuł na środku */}
                            <div style={{flex: 1, textAlign: 'center'}}>
                                <Card.Title style={{fontSize: "1.8rem", marginBottom: 0}}>
                                    {post.title}
                                </Card.Title>
                            </div>
                            {/* Autor po prawej */}
                            <div>
                                <Card.Subtitle className="text-secondary">
                                    {post.author.firstName} {post.author.lastName}
                                </Card.Subtitle>
                            </div>
                        </div>

                        {/* Przyciski "Edytuj" i "Usuń" */}
                        {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                            <div className="d-flex justify-content-between mt-3">
                                <Button variant="outline-light" onClick={() => handleEditPost(post)}>
                                    Edytuj
                                </Button>
                                <Button variant="danger" onClick={() => handleDeletePost(post.id)}>
                                    Usuń
                                </Button>
                            </div>
                        )}

                        {/* Treść posta */}
                        <Card.Text className="mt-3">
                            {(post.content.length > 200 && !showMoreStates[post.id])
                                ? `${post.content.substring(0, 200)}...`
                                : post.content}
                        </Card.Text>
                        {/* Przycisk "Czytaj więcej" */}
                        {(post.content.length > 200 && !showMoreStates[post.id]) && (
                            <Button
                                variant="outline-light"
                                className="mt-2"
                                onClick={() => handleShowMore(post.id)}
                            >
                                Czytaj więcej
                            </Button>
                        )}

                        {/* Miniaturki obrazków */}
                        <div className="d-flex flex-wrap justify-content-center mt-2">
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

                        {/* Efekt rozmytych krawędzi */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                                boxShadow: "inset 0 0 25px rgba(0, 0, 0, 1)",
                            }}
                        ></div>
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

            {/* Modal edycji posta */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edytuj post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group controlId="editPostTitle" className="mb-3">
                            <Form.Label>Tytuł posta</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Wprowadź tytuł"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                maxLength={255}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="editPostContent" className="mb-3">
                            <Form.Label>Treść posta</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Wprowadź treść posta"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                maxLength={3500}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="editPostImages" className="mb-3">
                            <Form.Label>Dodaj zdjęcia</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleEditFileUpload}
                                disabled={isUploading} // Zablokuj, gdy obrazy są przesyłane
                            />
                        </Form.Group>

                        {isUploading && (
                            <Spinner animation="border" role="status">
                                <span className="sr-only"></span>
                            </Spinner>
                        )}

                        {/* Podgląd obrazów */}
                        {previewImages.length > 0 && (
                            <Row className="mb-3">
                                <Col>
                                    <h5>Podgląd zdjęć</h5>
                                    <div className="d-flex flex-wrap">
                                        {previewImages.map((src, index) => (
                                            <div key={index} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                                                <img
                                                    src={src}
                                                    alt={`preview_${index}`}
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                {!isUploading &&
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        style={{position: 'absolute', top: '0', right: '0'}}
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        &times;
                                                    </Button>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        <Button type="submit" variant="primary" disabled={isUploading}>
                            Zapisz zmiany
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};
