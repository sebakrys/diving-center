import React, {useCallback, useEffect} from "react";
import logo from './logo.svg';
import './App.css';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { loadBubblesPreset } from "tsparticles-preset-bubbles";
import Content from "./components/Content";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {Button} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import SecurityService from "./service/SecurityService";
import {UserProvider} from "./service/UserContext";
import { StylesProvider, createGenerateClassName } from '@mui/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
  seed: 'mui-jss',
});


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


  useEffect(() => {
    SecurityService.initialize();

    async function fetchRoles() {
      await SecurityService.reloadRoles();
      //console.log("App fetchRoles")
    }
    fetchRoles();

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
                    enable: false,
                    mode: "attract",
                  },
                  resize: false,
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
                  value: 5,
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
          <UserProvider>
            <StylesProvider generateClassName={generateClassName}>
            <Content/>
            </StylesProvider>
          </UserProvider>
        </div>
      </div>
      </ThemeProvider>
  );
}

export default App;
