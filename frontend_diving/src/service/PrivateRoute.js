import React from 'react';
import { Navigate } from 'react-router-dom';
import SecurityService from "./SecurityService";

const PrivateRoute = ({ children }) => {
    return SecurityService.isLoggedIn() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;