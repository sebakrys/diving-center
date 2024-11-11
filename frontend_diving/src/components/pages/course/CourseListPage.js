import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Modal, Button, Form, Table, Container} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import CONFIG from "../../../config";

const COURSE_REST_URL = CONFIG.REST_URL;
//const COURSE_REST_URL = 'http://localhost:8080';

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [showModalAddCourse, setShowModalAddCourse] = useState(false);
    const [showModalEditCourse, setShowModalEditCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', description: '' });
    const [editingCourse, setEditingCourse] = useState({ id:'', name: '', description: '' });

    const navigate = useNavigate(); // Hook do nawigacji



    useEffect(() => {
        // Pobranie wszystkich kursów
        axios.get(COURSE_REST_URL+'/courses/')
            .then(response => setCourses(response.data))
            .catch(error => console.error('Error fetching courses:', error));
    }, []);

    // Funkcja otwierająca/zamykająca modal
    const toggleModalAddCourse = () => setShowModalAddCourse(!showModalAddCourse);

    const toggleModalEditCourse = () => setShowModalEditCourse(!showModalEditCourse);


    // Funkcja obsługująca tworzenie nowego kursu
    const handleCreateCourse = () => {
        axios.post(COURSE_REST_URL+'/courses/', newCourse)
            .then(response => {
                setCourses([...courses, response.data]);
                toggleModalAddCourse();
            })
            .catch(error => console.error('Error creating course:', error));
    };

    const handleEditCourse = () => {
        axios.put(COURSE_REST_URL+'/courses/'+editingCourse.id, editingCourse)
            .then(response => {
                setCourses(
                    courses.map(course =>
                    course.id === editingCourse.id ? response.data : course
                ));
                toggleModalEditCourse();
            })
            .catch(error => console.error('Error editing course:', error));
    };

    const handleDeleteCourse = (courseId) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć ten kurs?");
        if(confirmed){
            axios.delete(COURSE_REST_URL+'/courses/'+courseId)
                .then(response => {
                    setCourses(courses.filter(course => course.id !== courseId));
                })
                .catch(error => console.error('Error deleting course:', error));
        }
    };

    return (
        <Container data-bs-theme="dark">
            <h1 className="mt-5 text-white">Lista kursów</h1>
            <Button className="mt-3 mb-4 text-white"onClick={toggleModalAddCourse}>Dodaj Nowy Kurs</Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Opis</th>
                    <th></th>
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
                        >
                            {
                                course.description.split("\n").map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))
                            }
                        </td>
                        <td><Button variant="outline-info"
                                    onClick={() => {
                                        setEditingCourse({
                                            id: course.id,
                                            name: course.name,
                                            description: course.description
                                        })
                                        toggleModalEditCourse(course.id, course.name, course.description)

                                    }}>
                            Edytuj
                        </Button>
                        </td>
                        <td><Button variant="outline-danger"
                                    onClick={() => handleDeleteCourse(course.id)}>
                            Usuń
                        </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {/* Modal do dodawania nowego kursu */}
            <Modal show={showModalAddCourse} onHide={toggleModalAddCourse}>
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
                                maxLength={255}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCourseDescription">
                            <Form.Label>Opis Kursu</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Podaj opis kursu"
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                maxLength={3500}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleModalAddCourse}>Zamknij</Button>
                    <Button variant="primary" onClick={handleCreateCourse}>Zapisz Kurs</Button>
                </Modal.Footer>
            </Modal>

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
                                rows={2}
                                placeholder="Podaj opis kursu"
                                value={editingCourse.description}
                                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                maxLength={3500}
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

export default CourseListPage;
