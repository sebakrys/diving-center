import React, { useCallback } from "react";
import logo from './logo.svg';
import './App.css';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

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
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
  );
}

export default App;
