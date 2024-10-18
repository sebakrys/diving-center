import React, { useState, useEffect, useRef } from "react";
import { withTranslation } from 'react-i18next';

function Home() {
    const [scrollBlocked, setScrollBlocked] = useState(true);
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                const navbarRect = navbar.getBoundingClientRect();
                if (navbarRect.top <= 0) {
                    // Navbar jest na górze
                    setScrollBlocked(false);
                } else {
                    // Navbar nie jest na górze
                    setScrollBlocked(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Czyszczenie eventu przy odmontowaniu komponentu
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
            <iframe
                ref={iframeRef}
                title="Static HTML"
                src="/aboutUs.html"
                style={{
                    width: "100%",
                    height: "100vh",
                    border: "none",
                    margin: "0",
                    padding: "0",
                    paddingTop: "50px",
                    pointerEvents: scrollBlocked ? "none" : "auto",
                }}
            />
        </div>
    );
}

export default withTranslation()(Home);
