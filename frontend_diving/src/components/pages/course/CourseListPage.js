import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Modal, Button, Form, Table, Container} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

const COURSE_REST_URL = 'http://localhost:8080';

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', description: '' });

    const navigate = useNavigate(); // Hook do nawigacji



    useEffect(() => {
        // Pobranie wszystkich kursów
        axios.get(COURSE_REST_URL+'/courses/')
            .then(response => setCourses(response.data))
            .catch(error => console.error('Error fetching courses:', error));
    }, []);

    // Funkcja otwierająca/zamykająca modal
    const toggleModal = () => setShowModal(!showModal);

    // Funkcja obsługująca tworzenie nowego kursu
    const handleCreateCourse = () => {
        axios.post(COURSE_REST_URL+'/courses/', newCourse)
            .then(response => {
                setCourses([...courses, response.data]);
                toggleModal();
            })
            .catch(error => console.error('Error creating course:', error));
    };

    return (
        <Container data-bs-theme="dark">
            <h1 className="mt-5 text-white">Lista kursów</h1>
            <Button className="mt-3 mb-4 text-white"onClick={toggleModal}>Dodaj Nowy Kurs</Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Opis</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {courses.map(course => (
                    <tr key={course.id}>
                        <td
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >{course.id}</td>
                        <td
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            {course.name}
                        </td>
                        <td
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >{course.description}</td>
                        <td><Button variant="outline-danger"
                                    onClick={() => alert(course.id+" "+course.name)}>
                            Usuń
                        </Button></td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {/* Modal do dodawania nowego kursu */}
            <Modal show={showModal} onHide={toggleModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Dodaj Nowy Kurs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCourseName">
                            <Form.Label>Nazwa Kursu</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Podaj nazwę kursu"
                                value={newCourse.name}
                                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCourseDescription">
                            <Form.Label>Opis Kursu</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Podaj opis kursu"
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleModal}>Zamknij</Button>
                    <Button variant="primary" onClick={handleCreateCourse}>Zapisz Kurs</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CourseListPage;
