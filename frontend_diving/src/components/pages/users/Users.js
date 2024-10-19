import {Button, Container, Form, Table} from "react-bootstrap";
import React, { useState, useEffect } from "react";
import SecurityService from "../../../service/SecurityService";
import UsersService from "../../../service/UsersService";
import EventsService from "../../../service/EventsService";


function Users() {
    const [allUsers, setAllUsers] = useState([]);
    const [switchActiveStates, setSwitchActiveStates] = useState({});
    const [switchNonBlockedStates, setSwitchNonBlockedStates] = useState({});

    const fetchUsers = async () => {
        setAllUsers([])
        if (SecurityService.isUserInRole("ROLE_ADMIN")) {
            try {
                const result = await UsersService.getAllUsers();
                if (result.success) {
                    console.log(JSON.stringify(result.users))
                    setAllUsers(result.users)
                }
            } catch (error) {
                console.error('Błąd podczas pobierania użytkowników:', error);
            }
        }
    };

    useEffect(() => {


            fetchUsers(); // Pobieramy rejestracje na podstawie wybranego wydarzenia

    }, []);

    useEffect(() => {

        if (allUsers.length > 0) { // Sprawdzamy, czy mamy rejestracje
            const initialActiveSwitchStates = {};
            const initialNonBlockedSwitchStates = {};

            allUsers.forEach((user) => {
                initialActiveSwitchStates[user.id] = user.active;
                initialNonBlockedSwitchStates[user.id] = user.nonBlocked;
            });

            setSwitchActiveStates(initialActiveSwitchStates); // Ustawiamy stan przełączników
            setSwitchNonBlockedStates(initialNonBlockedSwitchStates); // Ustawiamy stan przełączników
        }

    }, [allUsers]);


    const handleActiveSwitchChange = (id) => {
        const newSwitchState = !switchActiveStates[id];

        setSwitchActiveStates((prevState) => ({
            ...prevState,
            [id]: newSwitchState // Odwracamy stan dla danego id
        }));
        UsersService.setActiveUser(id, newSwitchState).then(() => {
            console.log("Stan zaakceptowania Rezerwacji został zaktualizowany");
        })
            .catch((error) => {
                console.error('Błąd podczas aktualizacji statusu akceptacji Rezerwacji:', error);
            });
    };

    const handleNonBlockedSwitchChange = (id) => {
        const newSwitchState = !switchNonBlockedStates[id];

        setSwitchNonBlockedStates((prevState) => ({
            ...prevState,
            [id]: newSwitchState // Odwracamy stan dla danego id
        }));
        UsersService.setNonBlockedUser(id, newSwitchState).then(() => {
            console.log("Stan zaakceptowania Rezerwacji został zaktualizowany");
        })
            .catch((error) => {
                console.error('Błąd podczas aktualizacji statusu akceptacji Rezerwacji:', error);
            });
    };

    return (
        <Container data-bs-theme="dark">
            <h2 className="mt-5 text-white">Użytkownicy</h2>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Aktywowany</th>
                    <th>Zablokowany</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {
                    allUsers.map(
                        (user, index) =>
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.roles}</td>
                                <td>
                                    <Form.Check
                                        type="switch"
                                        id={`active-switch-${user.id}`}
                                        checked={switchActiveStates[user.id]}
                                        onChange={() => handleActiveSwitchChange(user.id)}
                                    />
                                </td>
                                <td>
                                    <Form.Check className="danger"
                                        type="switch"
                                        id={`nonblock-switch-${user.id}`}
                                        checked={!switchNonBlockedStates[user.id]}
                                        onChange={() => handleNonBlockedSwitchChange(user.id)}
                                    />
                                </td>
                                <td></td>
                            </tr>
                    )
                }
                </tbody>
            </Table>
        </Container>
    );

}
export default Users;