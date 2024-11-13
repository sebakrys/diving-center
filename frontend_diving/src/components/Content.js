import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import Home from "./pages/home/Home";
import Events from "./pages/events/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Blog from "./pages/blog/Blog";
import Users from "./pages/admin/users/Users";
import Video from "./pages/Video";
import CourseListPage from "./pages/course/CourseListPage";
import CourseDetailPage from "./pages/course/CourseDetailPage";
import UserCoursesListPage from "./pages/course/UserCoursesListPage";
import CourseVideo from "./pages/course/CourseVideo";
import Home2 from "./pages/home/Home2";
import Home3 from "./pages/react_page/Home3";
import GrapesJs_Demo from "./pages/grapesjs_demo/GrapesJs_Demo";
import FilesPage from "./pages/admin/FilesPage";
import PrivateRoute from "../service/PrivateRoute";

class Content extends React.Component {
    render() {
        return (
            <HashRouter>
                <div>
                    {/* Obrazek nad NavBar */}
                    {/*
                    <img
                        src="/74f3ec6c-4574-4bc5-9517-3fdcd5e6fe56.png"
                        alt="Opis obrazka"
                        style={{ width: "100%", height: "auto" , opacity: "80%"}}
                    />
                    */}

                    {/* NavBar z pozycją sticky */}
                    <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
                        <NavBar />
                    </div>

                    {/* Reszta treści */}
                    <div style={{ marginTop: "20px" }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/home2" element={<PrivateRoute><Home2 /></PrivateRoute>} />
                            <Route path="/home3" element={<PrivateRoute><Home3 /></PrivateRoute>} />
                                <Route path="/grapesjs-demo" element={<PrivateRoute><GrapesJs_Demo /></PrivateRoute>} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/blog" element={<Blog />} />
                                <Route path="/my-courses" element={<PrivateRoute><UserCoursesListPage /></PrivateRoute>} />
                                <Route path="/courses" element={<PrivateRoute><CourseListPage /></PrivateRoute>} />
                                <Route path="/courses/:id" element={<PrivateRoute><CourseDetailPage /></PrivateRoute>} />
                                <Route path="/course-video/:materialId" element={<PrivateRoute><CourseVideo /></PrivateRoute>} />
                                <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
                                <Route path="/admin-files" element={<PrivateRoute><FilesPage /></PrivateRoute>} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                                <Route path="/video" element={<PrivateRoute><Video /></PrivateRoute>} />
                        </Routes>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default Content;
