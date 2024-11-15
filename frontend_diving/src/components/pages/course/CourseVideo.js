import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import 'shaka-player/dist/controls.css';
import "./courseVideoStyles.css"
import SecurityService from "../../../service/SecurityService";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {Button} from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import CONFIG from "../../../config";

const COURSE_REST_URL = CONFIG.REST_URL;
//const COURSE_REST_URL = 'http://localhost:8080';

function CourseVideo() {
    const { materialId } = useParams();  // Hook do pobierania parametru 'id' z URL
    const [sessionId, setSessionId] =  useState("ABC123"); // Przykładowy unikalny identyfikator sesji
    const [videoUrl, setVideoUrl] =  useState(null);
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isVisible, setIsVisible] = useState(true);
    const [course, setCourse] = useState(null);
    const [isWindowFocused, setIsWindowFocused] = useState(true);
    const [watermarkPosition, setWatermarkPosition] = useState({ top: "50%", left: "50%" });
    const [showBlackScreen, setShowBlackScreen] = useState(false);

    const navigate = useNavigate(); // Hook do nawigacji
    const containerRef = useRef(null);

    // Funkcja do losowego ustawienia pozycji watermarka
    const moveWatermark = () => {
        const top = `${20+(Math.random() * 60)}%`; // Losowe pozycje top między 0% a 90%
        const left = `${20+(Math.random() * 60)}%`; // Losowe pozycje left między 0% a 90%
        setWatermarkPosition({ top, left });
    };


    // Funkcja obsługująca utratę focusu
    const handleBlur = () => {
        console.log("Przeglądarka straciła focus Blur!");
        setIsWindowFocused(false);
        stopVideo();
    };

    // Funkcja obsługująca przywrócenie focusu
    const handleFocus = () => {
        console.log("Przeglądarka ma focus!");
        setIsWindowFocused(true);
        restoreVideo();
    };

    // Funkcja monitorująca zmianę rozmiaru okna
    const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Sprawdzanie, czy zmieniła się rozdzielczość okna
        if (newWidth !== windowSize.width || newHeight !== windowSize.height) {
            console.log("Rozdzielczość okna została zmieniona, możliwe nagrywanie ekranu!");
            // Możesz tu zatrzymać wideo lub wywołać inną reakcję
            stopVideo();
        }

        // Aktualizacja rozmiaru okna
        setWindowSize({ width: newWidth, height: newHeight });
    };

    // Funkcja monitorująca widoczność strony
    const handleVisibilityChange = () => {
        if (document.hidden) {
            console.log("Strona nie jest widoczna, możliwe nagrywanie w tle!");
            setIsVisible(false);
            // Możesz tu zatrzymać wideo
            stopVideo();
        } else {
            setIsVisible(true);
        }
    };

    // Zablokowanie menu kontekstowego (prawy przycisk myszy)
    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    // Zablokowanie kopiowania treści
    const handleCopy = (e) => {
        e.preventDefault();
        alert("Kopiowanie jest zablokowane!");
    };

    // Zatrzymanie wideo
    const stopVideo = () => {
        if(videoRef.current){
            if(videoRef.current.currentTime) videoRef.current.currentTime = 0;
            videoRef.current.pause();
        }
        setShowBlackScreen(true); // Pokazuje czarny ekran
    };

    // Wznowienie wideo
    const restoreVideo = () => {
        setShowBlackScreen(false); // Pokazuje czarny ekran
    };

    useEffect( () => {
        axios.get(COURSE_REST_URL+`/materials/${materialId}`)
            .then(response => {
                console.log("response.data: "+response.data.course.id)
                setVideoUrl(COURSE_REST_URL+response.data.url[0])
                setCourse(response.data.course)
            })
            .catch(error => console.error('Error fetching course material:', error));

    }, [materialId]);


    useEffect( () => {
        async function loadVideo() {
            try {
                await playerRef.current.load(videoUrl);
                //videoRef.current.play();
                setShowBlackScreen(false); // Ukrywa czarny ekran, gdy wideo gra
            } catch (error) {
                console.error('Error loading video:', error);
            }
        }

        if (videoUrl) {
            loadVideo();
        }

    }, [videoUrl]);










    useEffect(() => {
        // Nasłuchiwanie zmiany rozmiaru okna
        window.addEventListener("resize", handleResize);

        // Nasłuchiwanie zmiany widoczności strony
        document.addEventListener("visibilitychange", handleVisibilityChange);


        return () => {
            // Czyszczenie po unmount
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [windowSize]); // Efekt uruchamiany tylko, gdy zmienia się rozmiar okna

    useEffect( () => {


        const fetchUserNames = async () => {
            try {
                const result = await SecurityService.getCurrentUserUUIdByToken();
                if (result.success) {
                    var currentdate = new Date().toLocaleString()
                        .replaceAll(',','')
                        .replaceAll(" ", "_")
                        .replaceAll(":", "")
                        .replaceAll(".", "");

                    setSessionId(
                        result.userId +"_"+ currentdate
                    );
                } else {
                    // Możesz tutaj dodać obsługę błędu, jeśli `result.success` jest false
                    console.error("Nie udało się pobrać danych użytkownika.");
                }
            } catch (error) {
                console.error("Wystąpił błąd podczas pobierania danych użytkownika:", error);
            }
        };

        fetchUserNames();

        // Sprawdź, czy przeglądarka obsługuje Shaka Playera
        if (shaka.Player.isBrowserSupported()) {
            // Inicjalizuj Shaka Playera
            const player = new shaka.Player(videoRef.current);
            playerRef.current = player;

            // Inicjalizuj interfejs użytkownika Shaka Playera
            const ui = new shaka.ui.Overlay(player, containerRef.current, videoRef.current);
            ui.configure({
                controlPanelElements: [
                    'play_pause','time_and_duration',     // Element po lewej stronie
                    'spacer',          // Odstęp
                    'mute', 'volume', 'fast_forward','playback_rate' // Elementy po prawej stronie //TODO jesli doddamy 'fullscreen' to dodać obsłuję bo aktulanie jest czarny ekran z watermarkiem,
                ],
                playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                fastForwardRates: [2, 4, 8, 1],
                addSeekBar: true
            });

            // Dodaj filtr żądań sieciowych
            player.getNetworkingEngine().registerRequestFilter((type, request) => {
                if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
                    type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        request.headers['Authorization'] = 'Bearer ' + token;
                    }
                }
            });

            // Obsługa błędów
            player.addEventListener('error', onErrorEvent);
        } else {
            console.error('Shaka Player nie jest obsługiwany w tej przeglądarce.');
        }



        // Zablokowanie menu kontekstowego (prawy przycisk myszy)
        document.addEventListener('contextmenu', handleContextMenu);

        // Zablokowanie kopiowania treści
        document.addEventListener('copy', handleCopy);

        // Nasłuchiwanie zdarzeń focus i blur
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);


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


        // Poruszanie watermarkiem co 3 sekundy
        const interval = setInterval(moveWatermark, 1500);

        // Czyszczenie przy odmontowaniu komponentu
        return () => {
            // Czyszczenie po unmount
            // Usunięcie event listenerów przy unmount komponentu
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);

            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    const onErrorEvent = (event) => {
        console.error('Shaka Player Error:', event.detail);
    };


    const pako = require('pako');
    function compressAndEncode(input) {
        const compressed = pako.deflate(input, { to: 'string' });
        return btoa(compressed);
    }

    function decodeAndDecompress(encoded) {
        const compressed = atob(encoded);
        const decompressed = pako.inflate(compressed, { to: 'string' });
        return decompressed;
    }






    return (
        <>
            {course && (
                <Button className="mb-3" variant="outline-info" onClick={() => navigate(`/courses/${course.id}`)}>
                    <Icon.ArrowLeft /> {course.name}
                </Button>
            )}
            <div ref={containerRef} className="video-container shaka-video-container">
                {/* Znak wodny */}
                <div
                    className="watermark"
                    style={{ top: watermarkPosition.top, left: watermarkPosition.left }}
                >
                    {sessionId}
                </div>

                {/* Czarny ekran po zatrzymaniu wideo */}
                {showBlackScreen && <div className="black-screen"></div>}

                <video
                    ref={videoRef}
                    width="640"
                    height="480"
                    autoPlay
                ></video>
            </div>
        </>
    );



}

export default CourseVideo;
