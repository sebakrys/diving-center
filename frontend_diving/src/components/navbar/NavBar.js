import React, {useContext, useEffect, useState} from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import i18n from "i18next";
import SecurityService from "../../service/SecurityService";
import './navbarStyles.css';
import {UserContext} from "../../service/UserContext";

function NavBar() {
    const { isLoggedIn, setIsLoggedIn, userNames } = useContext(UserContext); // Pobierz wartości z kontekstu
    const navigate = useNavigate();


    const handleLogout = () => {
        SecurityService.logoutUser();
        setIsLoggedIn(false); // Aktualizuj stan zalogowania
        navigate('/login');
    };

    return (
        <Navbar id="navbar" expand="lg" className="bg-dark sticky-top" data-bs-theme="dark" style={{ opacity: "90%" }}>
            <Container style={{ opacity: "100%" }}>
                <Navbar.Brand href="#home">
                    <img src="/assets/img/logo.png" alt="Logo" />
                    True Divers
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Główna nawigacja */}
                    <Nav className="me-auto">
                        <Nav.Link href="#/home">Wstęp</Nav.Link>
                        <Nav.Link href="#/events">Kalendarz</Nav.Link>
                        <Nav.Link href="#/blog">Blog</Nav.Link>
                        {SecurityService.isUserInRole(["ROLE_ADMIN"]) &&
                            <>
                                <Nav.Link href="#/users" >Użytkownicy</Nav.Link>
                                <Nav.Link href="#/video" className="danger">Video</Nav.Link>
                            </>
                        }
                        {/*
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                        */}
                        {/* Dodatkowy napis na końcu listy w zwiniętym navbarze */}
                        <Nav.Item className="d-lg-none">
                            {SecurityService.isLoggedIn() ?
                                <>
                                    <Nav.Link onClick={handleLogout}>Wyloguj</Nav.Link>
                                    {userNames &&
                                        <span className="nav-link text-center">
                                            {userNames.firstName}<br/>{userNames.lastName}
                                        </span>
                                    }
                                </>
                                :
                                <>
                                    <Nav.Link href="#/register">Zarejestruj</Nav.Link>
                                    <Nav.Link href="#/login">Zaloguj</Nav.Link>
                                </>
                            }
                        </Nav.Item>
                        {/* Select w zwiniętym navbarze */}
                        <Nav.Item className="d-lg-none">
                            <form className="d-flex justify-content-center">
                                <select
                                    className="form-select w-auto"
                                    size="1"
                                    name="lang"
                                    onChange={(event) => i18n.changeLanguage(event.target.value)}
                                    value={i18n.resolvedLanguage}
                                    disabled={true}
                                >
                                    <option value="pl">PL</option>
                                    <option value="en">EN</option>
                                </select>
                            </form>
                        </Nav.Item>
                    </Nav>
                    {/* Elementy po prawej stronie w rozwiniętym navbarze */}
                    <Nav className="ms-auto d-none d-lg-flex align-items-center">
                        {SecurityService.isLoggedIn() ?
                            <>
                                <Nav.Link className="me-2" onClick={handleLogout}>Wyloguj</Nav.Link>
                                {userNames &&
                                    <span className="navbar-text text-light text-wrap me-2" style={{ whiteSpace: "normal", textAlign: "right" }}>
                                        {userNames.firstName}<br />{userNames.lastName}
                                    </span>
                                }
                            </>
                            :
                            <>
                                <Nav.Link href="#/register">Zarejestruj</Nav.Link>
                                <Nav.Link href="#/login">Zaloguj</Nav.Link>
                            </>
                        }

                        <form className="mb-0">
                            <select
                                className="form-select"
                                size="1"
                                name="lang"
                                onChange={(event) => i18n.changeLanguage(event.target.value)}
                                value={i18n.resolvedLanguage}
                                disabled={true}
                            >
                                <option value="pl">PL</option>
                                <option value="en">EN</option>
                            </select>
                        </form>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
