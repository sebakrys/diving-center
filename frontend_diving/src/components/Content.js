import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./navbar/NavBar";
import {Button} from "react-bootstrap";
import Home from "./pages/Home";
import Events from "./pages/events/Events";

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "todo",
        };
    }

    render() {
        return (
            <div style={{
                marginTop: "58px",
                overflowY: "auto",
                overflowX: "auto",
                height: '100%'
            }}>
                <NavBar />
                <HashRouter>

                    <Routes>
                        <Route path={"/"} element={<Home />}/>
                        <Route path={"/home"} element={<Home />}/>
                        <Route path={"/events"} element={<Events />}/>
                    </Routes>
                </HashRouter>
            </div>
        );
    }
}

export default Content;
