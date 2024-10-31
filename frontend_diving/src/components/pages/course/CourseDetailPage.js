import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Col, Container, Form, Modal, Row, Spinner, Table} from 'react-bootstrap';
import BlogService from "../../../service/BlogService";
import CourseService from "../../../service/CourseService";
import SecurityService from "../../../service/SecurityService";
import * as Icon from 'react-bootstrap-icons';
import CONFIG from "../../../config";

const COURSE_REST_URL = CONFIG.REST_URL;
//const COURSE_REST_URL = 'http://localhost:8080';

const CourseDetailPage = () => {
    const { id } = useParams();  // Hook do pobierania parametru 'id' z URL
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [users, setUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMaterial, setNewMaterial] = useState({ title: '', type: '', content: '', url: []});
    const [isUploading, setIsUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [uploadedFilesUrls, setUploadedFilesUrls] = useState([]);
    const [links, setLinks] = useState('');
    const [showModalEditCourse, setShowModalEditCourse] = useState(false);
    const [editingCourse, setEditingCourse] = useState({ id:'', name: '', description: '' });
    const [roles, setRoles] = useState([]);

    const handleFileOpenInNewTab = (url) => {
        console.log("url: "+url);
        const token = localStorage.getItem('token');
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania pliku');
                }
                return response.blob();
            })
            .then(blob => {
                const fileUrl = window.URL.createObjectURL(blob);
                window.open(fileUrl, '_blank');
            })
            .catch(error => {
                console.error('Błąd:', error);
            });
    }

    const handleFileDownload = (fileUrl, fileName, materialType) => {
        const token = localStorage.getItem('token');
        fetch(COURSE_REST_URL + fileUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania pliku');
                }
                return response.blob();
            })
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                if (materialType === "PDF" || materialType === "IMAGE") {
                    // Otwórz w nowej karcie
                    window.open(downloadUrl, '_blank');
                } else {
                    // Rozpocznij pobieranie
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = fileName || 'plik';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
            });
    };


    const navigate = useNavigate(); // Hook do nawigacji


    const toggleModalEditCourse = () => setShowModalEditCourse(!showModalEditCourse);

    const handleEditCourse = () => {
        axios.put(COURSE_REST_URL+'/courses/'+editingCourse.id, editingCourse)
            .then(response => {
                setCourse(
                    { ...course, name: editingCourse.name, description: editingCourse.description}
                );
                toggleModalEditCourse();
            })
            .catch(error => console.error('Error editing course:', error));
    };


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



    }, [id]);  // 'id' jest  dynamicznym parametrem z URL

    // Funkcja wyszukująca użytkowników do zapisania na kurs
    const searchUsers = (phrase) => {
        if(phrase.length>0) {
            axios.get(COURSE_REST_URL + `/users/search/${id}?query=${phrase}`)
                .then(response => setAvailableUsers(response.data))
                .catch(error => console.error('Error searching users:', error));
        }else{
            setAvailableUsers([])
        }

    };

    useEffect(() => {
        if (newMaterial.type === "LINK") {
            console.log(JSON.stringify(links))
            const separatedLinks = links.split("\n").filter(link => link.trim() !== ""); // Rozdziel linki na podstawie nowej linii i usuń puste
            console.log(JSON.stringify(separatedLinks))
            setNewMaterial(prevMaterial => ({
                ...prevMaterial,
                url: separatedLinks  // Zastąp istniejącą listę nową listą linków
            }));
        }
    }, [links]);

    // Dodanie nowego materiału do kursu
    const handleAddMaterial = () => {

        console.log(JSON.stringify(newMaterial))


        axios.post(COURSE_REST_URL+`/materials/${id}`, newMaterial)
            .then(response => setMaterials([...materials, response.data]))
            .catch(error => console.error('Error adding material:', error));
        setNewMaterial({ title: '', type: '', content: '', url: []})
        setIsFileUploaded(false)
        setPreviewImages([])
        setLinks('')

    };

    // Usuwanie  materiału do kursu
    const handleDeleteMaterial = (id) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć ten materiał?");
        if(confirmed){
            axios.delete(COURSE_REST_URL + `/materials/${id}`)
                .then(response => {
                    // Usuwamy materiał z listy materiałów w stanie
                    setMaterials(materials.filter(material => material.id !== id));
                })
                .catch(error => console.error('Error deleting material:', error));
        }
    };

    const handleDeleteUser = (userId, courseId) => {
        axios.delete(COURSE_REST_URL + `/courses/${courseId}/users/${userId}`)
            .then(response => {
                // Usuwamy materiał z listy materiałów w stanie
                setUsers(users.filter(user => user.uuid !== userId));
                searchUsers(searchQuery)
            })
            .catch(error => console.error('Error deleting user:', error));
    };

    const handleAddUser = (userId, courseId) => {
        console.log("userID "+userId+" courseId "+courseId)
        axios.post(COURSE_REST_URL + `/courses/${courseId}/users/${userId}`)
            .then(response => {
                setUsers([...users, response.data]);
                searchUsers(searchQuery)
            })
            .catch(error => console.error('Error adding user:', error));
    };


    useEffect(() => {//dynamiczne wyszukiwanie
        searchUsers(searchQuery)
    }, [searchQuery]);  // 'id' jest teraz dynamicznym parametrem z URL


    const handleRemoveImage = (index) => {
        setUploadedFilesUrls((prevImages) => prevImages.filter((_, i) => i !== index));
        setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
        // Zaktualizuj listę URL-i w newMaterial, usuwając odpowiedni element
        setNewMaterial(prevMaterial => ({
            ...prevMaterial,
            url: prevMaterial.url ? prevMaterial.url.filter((_, i) => i !== index) : [] // Usunięcie URL-a z listy
        }));
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
        const uploadedUrls = await CourseService.uploadFiles(files, type, newMaterial.url);
        //setNewMaterial({ ...newMaterial, url: uploadedUrls })
        // Dodaj nowe URL-e do istniejącej listy URL-i w newMaterial
        setNewMaterial(prevMaterial => ({
            ...prevMaterial,
            url: [...(prevMaterial.url || []), ...uploadedUrls]  // Łączymy stare URL-e z nowymi
        }));


        console.log(JSON.stringify(uploadedUrls))
        setUploadedFilesUrls((prevImages) => [...prevImages, ...uploadedUrls]);

        // Odblokuj przycisk "Zapisz zmiany" po zakończeniu przesyłania
        setIsUploading(false);
        setIsFileUploaded(true)
    };


    return (
        <Container data-bs-theme="dark">
            {course && (
                <>
                    <h3 className="text-white">Kurs:</h3>
                    <h1 className="text-white">{course.name}</h1>
                    <h5 className="text-white">{course.description}</h5>

                    {SecurityService.isUserInRole(["ROLE_EMPLOYEE", "ROLE_ADMIN"]) && (
                    <Button variant="outline-info"
                            onClick={() => {
                                setEditingCourse({
                                    id: course.id,
                                    name: course.name,
                                    description: course.description
                                })
                                toggleModalEditCourse(course.id, course.name, course.description)

                            }}>
                        <Icon.Pen/>
                        Edytuj
                    </Button>
                    )}









                    {materials.length>0 &&(<>
                    <h2 className="text-white mt-5">Materiały Kursu(KLIENT/PRACOWNIK/ADMIN)</h2>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Typ</th>
                            <th>Tytuł</th>
                            <th>Zawartość</th>
                            <th>URL</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {materials.map(material => (
                            <tr key={material.id}>
                                <td>
                                    {material.type}
                                </td>
                                <td>
                                    {material.title}
                                </td>
                                <td>
                                    {material.content}
                                </td>
                                <td>
                                    {
                                        (material.url.length>0)
                                            && (

                                                material.type==="LINK" ? (


                                    material.url.map((single_url) => (
                                    <div >
                                        <a href={single_url} target="_blank" rel="noopener noreferrer">
                                            {single_url}
                                        </a>
                                    </div>
                                    ))
                                        ) : (

                                                    material.type==="VIDEO" ? (

                                                    material.url.map((single_url, index) => (
                                                        <div >
                                                            <Button variant="outline-info" onClick={() => navigate(`/course-video/${material.id}`)}>
                                                                VIDEO
                                                            </Button>
                                                        </div>
                                                    ))
                                                    )
                                                        :

                                                        (
                                                            material.url.map((single_url, index) => (
                                                                <div >
                                                                    <a class="link-success"

                                                                       onClick={() => handleFileOpenInNewTab(COURSE_REST_URL+single_url)}
                                                                    >
                                                                        {material.type+"_"+(index+1)}
                                                                    </a>
                                                                </div>
                                                            ))
                                                        )

                                                )
                                        )}
                                </td>
                                <td>
                                    {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) &&

                                        <Button variant="outline-danger"
                                                onClick={() => handleDeleteMaterial(material.id)}>
                                            Usuń
                                        </Button>
                                    }

                                </td>
                            </tr>
                        ))}
                        </tbody>
                        </Table>
                    </>)}














                    {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (<>

                        <h3 className="text-white">Dodaj Nowy Materiał(PRACOWNIK/ADMIN)</h3>
                        <Form>
                            <Form.Group controlId="formMaterialType">
                                <Form.Label className="text-white">Typ Materiału</Form.Label>
                                <Form.Select
                                    as="select"
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                    required
                                    disabled={isFileUploaded}
                                >
                                    <option>Wybierz typ materiału</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="VIDEO">VIDEO</option>//TODO sprawdzać czy wybrane sa pliki sa .m3u8 i .ts
                                    <option value="PDF">PDF</option>//TODO sprawdzić czy przesyłamy na pewno pdf
                                    <option value="IMAGE">IMAGE</option>//TODO sprawdzić czy przesłane pliki to na pewno obrazy i w dobrym formacie //TODO przetestować rożne formaty obrazów
                                    <option value="FILE">FILE</option>
                                    <option value="LINK">LINK</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="formMaterialTitle">
                                <Form.Label className="text-white">Tytuł</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Podaj tytuł materiału"
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                />
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
                            {(newMaterial.type === "LINK")
                                &&
                                <Form.Group controlId="formMaterialContent">
                                    <Form.Label className="text-white">Linki</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}  // Ustaw liczbę widocznych wierszy
                                        placeholder="Podaj linki, każdy w nowej linii"
                                        value={links}
                                        onChange={(e) => setLinks(e.target.value)}
                                    />
                                </Form.Group>
                            }
                            <Button onClick={handleAddMaterial}
                                    disabled={isUploading}
                            >Dodaj Materiał</Button>
                        </Form>

                    </>)}

                    {(SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && users.length>0) && (<>
                    <h2 className="text-white">Klienci Zapisani na Kurs</h2>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>UUID</th>
                            <th>Uzytkownik</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.uuid}>
                                <td style={{ wordWrap: "break-word", whiteSpace: "normal", maxWidth: "50px" }}>
                                    {user.uuid}
                                </td>
                                <td>
                                    {user.firstName} {user.lastName} ({user.email})
                                </td>
                                <td><Button variant="outline-danger"
                                            onClick={() => handleDeleteUser(user.uuid, course.id)}>
                                    Usuń
                                </Button></td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    </>)}


                    {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (<>
                    <h3 className="text-white">Zapisz Klienta na kurs</h3>
                    <Form.Control
                        type="text"
                        placeholder="Wyszukaj po imieniu, nazwisku lub emailu"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Table striped bordered hover>
                        <tbody>
                        {availableUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    {user.firstName} {user.lastName} ({user.email})
                                </td>
                                <td><Button variant="outline-success"
                                            onClick={() => handleAddUser(user.uuid, course.id)}>
                                    Dodaj
                                </Button></td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    </>)}
                </>
            )}





            <Modal show={showModalEditCourse} onHide={toggleModalEditCourse}>
                <Modal.Header closeButton>
                    <Modal.Title>Edytuj Kurs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCourseName">
                            <Form.Label>Nazwa Kursu</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj nazwę kursu"
                                value={editingCourse.name}
                                onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                maxLength={255}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCourseDescription">
                            <Form.Label>Opis Kursu</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Podaj opis kursu"
                                value={editingCourse.description}
                                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                maxLength={255}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleModalEditCourse}>Zamknij</Button>
                    <Button variant="primary" onClick={handleEditCourse}>Edytuj Kurs</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default CourseDetailPage;
