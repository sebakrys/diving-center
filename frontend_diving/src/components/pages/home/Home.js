import React, { useState, useEffect, useRef } from "react";
import { withTranslation } from 'react-i18next';
import CONFIG from "../../../config";
const FILES_REST_URL = CONFIG.REST_URL;


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

        const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight;
        if(isAtBottom) setScrollBlocked(false);//naprawia problem gdy przechodzimy na strone z innej i juz jest na samym dole

        console.log(window.innerHeight +" "+ window.scrollY+" "+(window.innerHeight+window.scrollY)+" "+document.body.scrollHeight);

        // Czyszczenie eventu przy odmontowaniu komponentu
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div style={{ position: "relative", height: "calc(100vh - 60px)", overflow: "hidden" , paddingTop: "-20px"}}>
            <iframe
                ref={iframeRef}
                title="Static HTML"
                src={`${FILES_REST_URL}/pages/home.html`}
                style={{
                    width: "100%",
                    height: "calc(100vh - 60px)",
                    border: "none",
                    margin: "0",
                    padding: "0",
                    //pointerEvents: scrollBlocked ? "none" : "auto",
                }}
            />
        </div>
    );
}

export default withTranslation()(Home);
