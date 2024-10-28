import {Button, Container, Form, Table} from "react-bootstrap";
import React, { useState, useEffect } from "react";
import SecurityService from "../../../service/SecurityService";
import UsersService from "../../../service/UsersService";
import EventsService from "../../../service/EventsService";


function Users() {
    const [allRoles, setAllRoles] = useState([
        {name: "AAAAAAAAAAAAA"},
        {name: "ABC"},
        {name: "ABC"},
    ]);
    const [allUsers, setAllUsers] = useState([
        {"firstName":"AAAAAAAAA","lastName":"AAAAAAAAAA","email":"AAAAAAAAAAAAAAAAAAA.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
        {"firstName":"","lastName":"","email":"@.com","active":true,"nonBlocked":true,"roles":[]},
    ]);
    const [switchActiveStates, setSwitchActiveStates] = useState({});
    const [switchNonBlockedStates, setSwitchNonBlockedStates] = useState({});

    const fetchUsers = async () => {
        //setAllUsers([])
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
        const fetchRoles = async () => {
            try {
                const result = await UsersService.getAllRoles();
                if (result.success) {
                    setAllRoles(result.roles);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania ról:', error);
            }
        };

        fetchRoles();
        fetchUsers(); // Pobieramy rejestracje na podstawie wybranego wydarzenia

    }, []);

    useEffect(() => {

        if (allUsers.length > 0) { // Sprawdzamy, czy mamy rejestracje
            const initialActiveSwitchStates = {};
            const initialNonBlockedSwitchStates = {};

            allUsers.forEach((user) => {
                initialActiveSwitchStates[user.uuid] = user.active;
                initialNonBlockedSwitchStates[user.uuid] = user.nonBlocked;
            });

            setSwitchActiveStates(initialActiveSwitchStates); // Ustawiamy stan przełączników
            setSwitchNonBlockedStates(initialNonBlockedSwitchStates); // Ustawiamy stan przełączników
        }

    }, [allUsers]);



    const handleRoleChange = async (userId, roleName) => {
        const user = allUsers.find(u => u.id === userId);
        const hasRole = user.roles.some(role => role.name === roleName);

        try {
            if (hasRole) {
                // Usuń rolę z użytkownika
                await UsersService.removeRoleFromUser(userId, roleName);
                // Aktualizuj stan
                const updatedUsers = allUsers.map(u => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            roles: u.roles.filter(role => role.name !== roleName),
                        };
                    }
                    return u;
                });
                setAllUsers(updatedUsers);
            } else {
                // Dodaj rolę do użytkownika
                await UsersService.assignRoleToUser(userId, roleName);
                // Aktualizuj stan
                const updatedUsers = allUsers.map(u => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            roles: [...u.roles, allRoles.find(role => role.name === roleName)],
                        };
                    }
                    return u;
                });
                setAllUsers(updatedUsers);
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji ról użytkownika:', error);
        }
    };




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
                    <th>UUID</th>
                    <th>{/*TODO usuwanie użytkowników*/}</th>
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
                                <td>

                                    {/* Wyświetlanie ról jako checkboxów */}
                                    {allRoles.map(role => (
                                        <Form.Check
                                            key={`${user.uuid}-${role.id}`}
                                            type="checkbox"
                                            label={role.name}
                                            checked={user.roles.some(userRole => userRole.id === role.id)}
                                            onChange={() => handleRoleChange(user.uuid, role.name)}
                                        ></Form.Check>
                                    ))}

                                </td>
                                <td>
                                    <Form.Check
                                        type="switch"
                                        id={`active-switch-${user.uuid}`}
                                        checked={switchActiveStates[user.uuid]}
                                        onChange={() => handleActiveSwitchChange(user.uuid)}
                                    />
                                </td>
                                <td>
                                    <Form.Check className="danger"
                                        type="switch"
                                        id={`nonblock-switch-${user.uuid}`}
                                        checked={!switchNonBlockedStates[user.uuid]}
                                        onChange={() => handleNonBlockedSwitchChange(user.uuid)}
                                    />
                                </td>
                                <td>{user.uuid}</td>
                                <td>
                                </td>
                            </tr>
                    )
                }
                </tbody>
            </Table>
        </Container>
    );

}
export default Users;