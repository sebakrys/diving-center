import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import Home from "./pages/Home";
import Events from "./pages/events/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Blog from "./pages/blog/Blog";

class Content extends React.Component {
    render() {
        return (
            <HashRouter>
                <div>
                    {/* Obrazek nad NavBar */}
                    <img
                        src="/74f3ec6c-4574-4bc5-9517-3fdcd5e6fe56.png"
                        alt="Opis obrazka"
                        style={{ width: "100%", height: "auto" , opacity: "95%"}}
                    />

                    {/* NavBar z pozycją sticky */}
                    <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
                        <NavBar />
                    </div>

                    {/* Reszta treści */}
                    <div style={{ marginTop: "20px" }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default Content;
