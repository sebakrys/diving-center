import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

const COURSE_REST_URL = 'http://localhost:8080';

const CourseDetailPage = () => {
    const { id } = useParams();  // Hook do pobierania parametru 'id' z URL
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [users, setUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMaterial, setNewMaterial] = useState({ title: '', type: '', content: '' });

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


    useEffect(() => {//dynamiczne wyszukiwanie
        searchUsers(searchQuery)
    }, [searchQuery]);  // 'id' jest teraz dynamicznym parametrem z URL

    return (
        <div>
            {course && (
                <>
                    <h1>Szczegóły Kursu: {course.name}</h1>
                    <p>{course.description}</p>

                    <h2>Materiały Kursu</h2>
                    <ul>
                        {materials.map(material => (
                            <li key={material.id}>
                                {material.title} ({material.type}) {material.type === 'VIDEO' && <a href={material.url}>Otwórz Wideo</a>}
                            </li>
                        ))}
                    </ul>

                    <h3>Dodaj Nowy Materiał</h3>
                    <Form>
                        <Form.Group controlId="formMaterialTitle">
                            <Form.Label>Tytuł</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj tytuł materiału"
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMaterialType">
                            <Form.Label>Typ Materiału</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="VIDEO, PDF, etc."
                                value={newMaterial.type}
                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formMaterialContent">
                            <Form.Label>Zawartość/Link</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj zawartość lub link"
                                value={newMaterial.content}
                                onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                            />
                        </Form.Group>
                        <Button onClick={handleAddMaterial}>Dodaj Materiał</Button>
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
