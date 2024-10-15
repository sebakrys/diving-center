import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pl';
import {Button} from "react-bootstrap";
import SecurityService from "../../../service/SecurityService";
import {CreateBlogPostForm} from "./BlogForms";

const localizer = momentLocalizer(moment);

class Events extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedEvent: null,
            showCreateForm: false,
            showEditEventForm: false,
            showEventRegistrations: false,
            events: [],
        };
    }

    componentDidMount() {
        const month = moment().month() + 1;
        const year = moment().year();
    }



    render() {
        return (
            <div>
                {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                    <div>
                        <CreateBlogPostForm/>
                    </div>
                )}
                POSTY
            </div>
        );
    }
}

export default Events;
