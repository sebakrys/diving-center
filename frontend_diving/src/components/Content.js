import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import Home from "./pages/home/Home";
import Events from "./pages/events/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Blog from "./pages/blog/Blog";
import Users from "./pages/users/Users";
import Video from "./pages/Video";
import CourseListPage from "./pages/course/CourseListPage";
import CourseDetailPage from "./pages/course/CourseDetailPage";
import UserCoursesListPage from "./pages/course/UserCoursesListPage";
import CourseVideo from "./pages/course/CourseVideo";
import Home2 from "./pages/home/Home2";
import Home3 from "./pages/home/Home3";

class Content extends React.Component {
    render() {
        return (
            <HashRouter>
                <div>
                    {/* Obrazek nad NavBar */}
                    <img
                        src="/74f3ec6c-4574-4bc5-9517-3fdcd5e6fe56.png"
                        alt="Opis obrazka"
                        style={{ width: "100%", height: "auto" , opacity: "80%"}}
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
                            <Route path="/home2" element={<Home2 />} />
                            <Route path="/home3" element={<Home3 />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/my-courses" element={<UserCoursesListPage />} />
                            <Route path="/courses" element={<CourseListPage />} />
                            <Route path="/courses/:id" element={<CourseDetailPage />} />
                            <Route path="/course-video/:materialId" element={<CourseVideo />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/video" element={<Video />} />
                        </Routes>
                    </div>
                </div>
            </HashRouter>
        );
    }
}

export default Content;
