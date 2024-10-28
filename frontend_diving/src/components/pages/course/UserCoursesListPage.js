import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Modal, Button, Form, Table, Container} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import SecurityService from "../../../service/SecurityService";

const COURSE_REST_URL = 'http://localhost:8080';

const UserCoursesListPage = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', description: '' });

    const navigate = useNavigate(); // Hook do nawigacji



    useEffect(() => {

        SecurityService.getCurrentUserUUIdByToken()
            .then(response => {
                const userId = response.userId;
                //console.log("userID:"+userId)


                axios.get(COURSE_REST_URL+'/courses/user/'+userId)
                    .then(response => setCourses(response.data))
                    .catch(error => console.error('Error fetching courses:', error));

            })
            .catch(error => console.error('Error fetching user ID:', error));


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
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Nazwa</th>
                    <th>Opis</th>
                </tr>
                </thead>
                <tbody>
                {courses.map(course => (
                    <tr key={course.id}>
                        <td
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            {course.name}
                        </td>
                        <td
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >{course.description}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default UserCoursesListPage;
