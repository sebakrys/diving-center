import React, { useEffect, useRef } from "react";
import shaka from "shaka-player";
import 'shaka-player/dist/controls.css';

function Video() {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Inicjalizacja Shaka Player
        playerRef.current = new shaka.Player(videoRef.current);

        // Obsługa błędów
        playerRef.current.addEventListener('error', onErrorEvent);

        // Konfiguracja DRM (opcjonalnie)
        /*
        playerRef.current.configure({
            drm: {
                servers: {
                    'com.widevine.alpha': 'https://your-license-server.com/widevine',
                },
                advanced: {
                    'com.widevine.alpha': {
                        videoRobustness: 'SW_SECURE_CRYPTO',
                        audioRobustness: 'SW_SECURE_CRYPTO',
                    },
                },
            },
        });
        */

        // Ładowanie zasobu
        async function loadVideo() {
            try {
                await playerRef.current.load("http://localhost:8080/video/my_video.mpd");
                videoRef.current.play();
            } catch (error) {
                console.error('Error loading video:', error);
            }
        }

        loadVideo();

        // Czyszczenie przy odmontowaniu komponentu
        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    const onErrorEvent = (event) => {
        console.error('Shaka Player Error:', event.detail);
    };

    return (
        <video
            ref={videoRef}
            width="640"
            height="480"
            controls
            autoPlay
        ></video>
    );
}

export default Video;
