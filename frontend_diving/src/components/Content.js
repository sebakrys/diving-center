import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./NavBar";
import {Button} from "react-bootstrap";

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "todo",
        };
    }

    render() {
        return (
            <div id="AppContainer">
                <NavBar />
                <iframe
                    title="Static HTML"
                    src="/aboutUs.html"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            </div>
        );
    }
}

export default Content;
