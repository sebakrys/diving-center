import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {Button, Col, Form, Row, Spinner, Table} from 'react-bootstrap';
import BlogService from "../../../service/BlogService";
import CourseService from "../../../service/CourseService";

const COURSE_REST_URL = 'http://localhost:8080';

const CourseDetailPage = () => {
    const { id } = useParams();  // Hook do pobierania parametru 'id' z URL
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [users, setUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMaterial, setNewMaterial] = useState({ title: '', type: '', content: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [uploadedFilesUrls, setUploadedFilesUrls] = useState([]);

    useEffect(() => {
        // Pobranie szczegółów kursu
        axios.get(COURSE_REST_URL+`/courses/${id}`)
            .then(response => setCourse(response.data))
            .catch(error => console.error('Error fetching course details:', error));

        // Pobranie materiałów kursu
        axios.get(COURSE_REST_URL+`/materials/course/${id}`)
            .then(response => setMaterials(response.data))
            .catch(error => console.error('Error fetching materials:', error));

        // Pobranie użytkowników zapisanych na kurs
        axios.get(COURSE_REST_URL+`/courses/${id}/users`)
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, [id]);  // 'id' jest teraz dynamicznym parametrem z URL

    // Funkcja wyszukująca użytkowników do zapisania na kurs
    const searchUsers = (phrase) => {
        axios.get(COURSE_REST_URL+`/users/search?query=${phrase}`)
            .then(response => setAvailableUsers(response.data))
            .catch(error => console.error('Error searching users:', error));
    };

    // Dodanie nowego materiału do kursu
    const handleAddMaterial = () => {
        axios.post(COURSE_REST_URL+`/materials/${id}`, newMaterial)
            .then(response => setMaterials([...materials, response.data]))
            .catch(error => console.error('Error adding material:', error));
    };

    // Usuwanie  materiału do kursu
    const handleDeleteMaterial = (id) => {
        axios.delete(COURSE_REST_URL + `/materials/${id}`)
            .then(response => {
                // Usuwamy materiał z listy materiałów w stanie
                setMaterials(materials.filter(material => material.id !== id));
            })
            .catch(error => console.error('Error deleting material:', error));
    };


    useEffect(() => {//dynamiczne wyszukiwanie
        searchUsers(searchQuery)
    }, [searchQuery]);  // 'id' jest teraz dynamicznym parametrem z URL


    const handleRemoveImage = (index) => {
        setUploadedFilesUrls((prevImages) => prevImages.filter((_, i) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    // Funkcja obsługująca aktualizację obrazów podczas edycji
    const handleFileUpload = async (event, type) => {
        const files = Array.from(event.target.files);

        // Generowanie podglądu obrazów
        const previews = files.map((file) => URL.createObjectURL(file));
        if(type==="IMAGE") {
            setPreviewImages((prevPreviews) => [...prevPreviews, ...previews]);
        }

        // Zablokuj przycisk "Zapisz zmiany" podczas przesyłania zdjęć
        setIsUploading(true);

        // Wyślij pliki na serwer
        const uploadedUrls = await CourseService.uploadFiles(files, type);
        setNewMaterial({ ...newMaterial, url: uploadedUrls })


        console.log(JSON.stringify(uploadedUrls))
        if(type==="IMAGE"){
            // Zaktualizuj adresy URL zdjęć
            setUploadedFilesUrls((prevImages) => [...prevImages, ...uploadedUrls]);
        }

        // Odblokuj przycisk "Zapisz zmiany" po zakończeniu przesyłania
        setIsUploading(false);
    };


    return (
        <div>
            {course && (
                <>
                    <h3 className="text-white">Kurs:</h3>
                    <h1 className="text-white">{course.name}</h1>
                    <p className="text-white">{course.description}</p>

                    <h2 className="text-white mt-5">Materiały Kursu(KLIENT/PRACOWNIK/ADMIN)</h2>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Tytuł</th>
                            <th>Typ</th>
                            <th>Zawartość</th>
                            <th>URL</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {materials.map(material => (
                            <tr key={material.id}>
                                <td>
                                    {material.title}
                                </td>
                                <td>
                                    {material.type}
                                </td>
                                <td>
                                    {material.content}
                                </td>
                                <td>
                                    {material.url}
                                </td>
                                <td><Button variant="outline-danger"
                                            onClick={() => handleDeleteMaterial(material.id)}>
                                    Usuń
                                </Button></td>
                            </tr>
                        ))}
                        </tbody>
                        </Table>



                    <h3 className="text-white">Dodaj Nowy Materiał(PRACOWNIK/ADMIN)</h3>
                    <Form>
                        <Form.Group controlId="formMaterialTitle">
                            <Form.Label className="text-white">Tytuł</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj tytuł materiału"
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMaterialType">
                            <Form.Label className="text-white">Typ Materiału</Form.Label>
                            <Form.Select
                                as="select"
                                value={newMaterial.type}
                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                required
                            >
                                <option>Wybierz typ materiału</option>
                                <option value="TEXT">TEXT</option>
                                <option value="VIDEO">VIDEO</option>
                                <option value="PDF">PDF</option>
                                <option value="IMAGE">IMAGE</option>
                                <option value="FILE">FILE</option>
                                <option value="LINK">LINK</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formMaterialContent">
                            <Form.Label className="text-white">Zawartość</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj zawartość lub link"
                                value={newMaterial.content}
                                onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                            />
                        </Form.Group>
                        {(newMaterial.type==="VIDEO" || newMaterial.type==="PDF" || newMaterial.type==="IMAGE" || newMaterial.type==="FILE")
                            &&
                            <>
                            <Form.Group controlId="postImages" className="mb-3">
                                <Form.Label className="mt-3 text-white h4">
                                    Dodaj {newMaterial.type}
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="*"
                                    multiple
                                    onChange={(event) => handleFileUpload(event, newMaterial.type)}
                                    disabled={isUploading} // Zablokuj, gdy obrazy są przesyłane
                                />
                            </Form.Group>
                                {isUploading && <Spinner animation="border" role="status"><span className="sr-only text-white h4"></span></Spinner>}


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
                            </>

                        }
                        <Button onClick={handleAddMaterial}
                                disabled={isUploading}
                        >Dodaj Materiał</Button>
                    </Form>

                    <h2>Użytkownicy Zapisani na Kurs</h2>
                    <ul>
                        {users.map(user => (
                            <li key={user.id}>{user.firstName} {user.lastName} ({user.email})</li>
                        ))}
                    </ul>

                    <h3>Wyszukaj Użytkownika</h3>
                    <Form.Control
                        type="text"
                        placeholder="Wyszukaj po imieniu, nazwisku lub emailu"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={searchUsers}>Wyszukaj</Button>
                    <ul>
                        {availableUsers.map(user => (
                            <li key={user.id}>{user.firstName} {user.lastName} ({user.email})</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default CourseDetailPage;
