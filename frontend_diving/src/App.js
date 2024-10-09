import React, { useCallback } from "react";
import logo from './logo.svg';
import './App.css';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { loadBubblesPreset } from "tsparticles-preset-bubbles";
import Content from "./components/Content";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {Button} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Główny kolor motywu
    },
    secondary: {
      main: '#dc004e',
    },
  },
});


function App() {
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // Możesz inicjalizować tsParticles tutaj, np. dodając własne kształty lub ustawienia.
    await loadSlim(engine); // Załaduj wersję Slim, aby zmniejszyć rozmiar pakietu
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log(container);
  }, []);

  return (
      <ThemeProvider theme={theme}>
      <div className="App">
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
              background: {
                color: {
                  value: "#001",
                },
              },
              fpsLimit: 60,
              interactivity: {
                events: {
                  onClick: {
                    enable: false,
                    mode: "push",
                  },
                  onHover: {
                    enable: true,
                    mode: "attract",
                  },
                  resize: true,
                },
                modes: {
                  bounce: {
                    distance: 10,
                  },
                  push: {
                    quantity: 4,
                  },
                  repulse: {
                    distance: 5,
                    duration: 0.1,
                  },
                },
              },
              particles: {
                color: {
                  value: "#134",
                },
                links: {
                  color: "#ffffff",
                  distance: 150,
                  enable: false,
                  opacity: 0.5,
                  width: 1,
                },
                collisions: {
                  enable: false,
                  mode: "bounce"
                },
                move: {
                  direction: "top",
                  enable: true,
                  outMode: "out",
                  random: false,
                  vibrate: true,
                  speed: 5,
                  straight: false,
                },
                number: {

                  density: {
                    enable: true,
                  },
                  value: 50,
                },
                opacity: {
                  value: 0.5,
                },
                shape: {
                  type: "circle",
                },
                size: {
                  anim: false,
                  random: true,
                  value: 20,
                },
              },
              detectRetina: true,
            }}
        />
        <div id="AppContainer">

          <Content/>
        </div>
      </div>
      </ThemeProvider>
  );
}

export default App;
