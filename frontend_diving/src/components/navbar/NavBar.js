import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {useTranslation, withTranslation} from 'react-i18next';
import i18n from "i18next";

import './navbarStyles.css'

function BasicExample() {
    return (
        <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark" style={{opacity: "90%"}} fixed={"top"}>
            <Container style={{opacity: "100%"}}>
                <div>
                    <Navbar.Toggle className={"mx-1"} aria-controls="basic-navbar-nav" />
                    <Navbar.Brand href="#home"><img src="/assets/img/logo.png"/>True Divers</Navbar.Brand>
                </div>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#/home">Home</Nav.Link>
                        <Nav.Link href="#/events">Events</Nav.Link>
                        <Nav.Link href="#/register">Register</Nav.Link>
                        <Nav.Link href="#/login">Login</Nav.Link>
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">
                                Another action
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">
                                Separated link
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Text className="ml-auto navbar-text-fixed">
                    <div>
                        <form>
                            <select className="form-select" size="1" name="lang"
                                    onChange={(event) => i18n.changeLanguage(event.target.value)}
                                    value={i18n.resolvedLanguage}>
                                <option value="pl">PL</option>
                                <option value="en">EN</option>
                            </select>
                        </form>
                    </div>
                </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export default BasicExample;