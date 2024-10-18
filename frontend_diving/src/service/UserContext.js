import React, { createContext, useState, useEffect } from 'react';
import SecurityService from "./SecurityService";


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(SecurityService.isLoggedIn());
    const [userNames, setUserNames] = useState(null);

    useEffect(() => {
        const fetchUserNames = async () => {
            if (isLoggedIn) {
                try {
                    const result = await SecurityService.getCurrentUserNames();
                    if (result.success) {
                        setUserNames(result.userNames);
                    } else {
                        setUserNames(null);
                    }
                } catch (error) {
                    console.error('Error fetching user names:', error);
                    setUserNames(null);
                }
            } else {
                setUserNames(null);
            }
        };

        fetchUserNames();
    }, [isLoggedIn]);

    return (
        <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, userNames, setUserNames }}>
            {children}
        </UserContext.Provider>
    );
};
