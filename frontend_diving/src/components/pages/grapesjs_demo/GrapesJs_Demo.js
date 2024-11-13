import React, { useEffect } from 'react';
import StudioEditor from '@grapesjs/studio-sdk/react';

function GrapesJs_Demo() {
    useEffect(() => {
        // Import stylów tylko dla tego komponentu
        // Import stylów tylko dla tego komponentu
        import('@grapesjs/studio-sdk/style')
            .then(() => {
                console.log('Styles loaded successfully.');
            })
            .catch((error) => {
                console.error('Error loading styles:', error);
            });

        console.log(process.env.REACT_APP_GRAPESJS_LICENSE_KEY)

        return () => {
            // Opcjonalne: Usuń style po odmontowaniu komponentu
            const styleElement = document.querySelector('link[href*="@grapesjs/studio-sdk/style"]');
            if (styleElement) styleElement.remove();
        };
    }, []);

    return (
        <StudioEditor style={{
            height: "100vh"
        }}
            options={{
                licenseKey: process.env.REACT_APP_GRAPESJS_LICENSE_KEY,  // użycie zmiennej środowiskowej
                theme: 'dark',
                project: {
                    type: 'web',
                    id: 'UNIQUE_PROJECT_ID',
                },
                identity: {
                    id: 'UNIQUE_END_USER_ID',
                },
                assets: {
                    storageType: 'cloud',
                },
                storage: {
                    type: 'cloud',
                    autosaveChanges: 100,
                    autosaveIntervalMs: 10000,
                },
            }}
        />
    );
}

export default GrapesJs_Demo;
