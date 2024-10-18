import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import i18n from "i18next";
import SecurityService from "../../service/SecurityService";
import './navbarStyles.css';

function NavBar() {

    const navigate = useNavigate();

    const handleLogout = () => {
        SecurityService.logoutUser();
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
                    <Nav className="me-auto">
                        <Nav.Link href="#/home">Home</Nav.Link>
                        <Nav.Link href="#/events">Events</Nav.Link>
                        <Nav.Link href="#/blog">Blog</Nav.Link>
                        {!SecurityService.isLoggedIn() &&
                            <>
                                <Nav.Link href="#/register">Register</Nav.Link>
                                <Nav.Link href="#/login">Login</Nav.Link>
                            </>
                        }
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                        {SecurityService.isLoggedIn() &&
                            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                        }
                    </Nav>
                </Navbar.Collapse>

                    <form>
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
            </Container>
        </Navbar>
    );
}

export default NavBar;
