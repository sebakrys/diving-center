import React, { useState } from 'react';
import Editor from '@react-page/editor';
import background, { ModeEnum } from '@react-page/plugins-background';
import divider from '@react-page/plugins-divider';
import html5Video from '@react-page/plugins-html5-video';
import { imagePlugin, ImageUploadType } from '@react-page/plugins-image';
import spacer from '@react-page/plugins-spacer';
import video from '@react-page/plugins-video';
import slate, { pluginFactories } from '@react-page/plugins-slate';
import { ColorPickerField } from '@react-page/editor';

import '@react-page/plugins-slate/lib/index.css';
import '@react-page/plugins-image/lib/index.css';
import '@react-page/plugins-spacer/lib/index.css';
import '@react-page/plugins-video/lib/index.css';
import '@react-page/plugins-html5-video/lib/index.css';
import '@react-page/plugins-background/lib/index.css';
import '@react-page/plugins-divider/lib/index.css';
import '@react-page/editor/lib/index.css';

import './home3Styless.css';

// Tworzenie niestandardowej wtyczki do koloru tekstu
const ColorPlugin = pluginFactories.createComponentPlugin({
    addHoverButton: true,
    addToolbarButton: true,
    type: 'SetColor',
    object: 'mark',
    icon: <span>Color</span>,
    label: 'Set Color',
    Component: 'span',
    getStyle: ({ color }) => ({ color }),
    controls: {
        type: 'autoform',
        schema: {
            type: 'object',
            required: ['color'],
            properties: {
                color: {
                    uniforms: {
                        component: ColorPickerField,
                    },
                    default: 'rgba(255, 255, 255, 1)', // Domyślny kolor biały
                    type: 'string',
                },
            },
        },
    },
});

// Inicjalizacja wtyczki slate z domyślnym białym kolorem tekstu
const slatePlugin = slate((config) => ({
    ...config,
    customStyleMap: {
        defaultColor: { color: 'white' }, // Domyślny kolor tekstu
    },
    placeholder: {
        color: 'rgba(255, 255, 255, 0.5)', // Kolor placeholdera
        text: 'Write here', // Tekst placeholdera
    },
    plugins: {
        ...config.plugins,
        formatting: {
            color: ColorPlugin,
        },
    },
}));

// Fake image upload service
function fakeImageUploadService(defaultUrl) {
    return function(file, reportProgress) {
        return new Promise((resolve) => {
            let counter = 0;
            const interval = setInterval(() => {
                counter++;
                reportProgress(counter * 10);
                if (counter > 9) {
                    clearInterval(interval);
                    alert('Image has not actually been uploaded to a server. This is a demo function.');
                    resolve({ url: URL.createObjectURL(file) });
                }
            }, 100);
        });
    };
}


// Konfiguracja wtyczek
const cellPlugins = [
    slatePlugin,
    spacer,
    imagePlugin({ imageUpload: fakeImageUploadService('/images/react.png') }),
    video,
    divider,
    html5Video,
    background({
        imageUpload: fakeImageUploadService('/images/sea-bg.jpg'),
        enabledModes: ModeEnum.COLOR_MODE_FLAG | ModeEnum.IMAGE_MODE_FLAG | ModeEnum.GRADIENT_MODE_FLAG,
    }),
];

// Główna funkcja komponentu

function Home3() {
    const [value, setValue] = useState({});

    return (
        <div style={{ background: 'rgba(255, 255, 240, 0.1)', color: 'white' }} className="pt-5 ms-2 me-2">
            <Editor
                cellPlugins={cellPlugins}
                onChange={setValue}
                value={value}
                style={{ color: 'white' }}
            />
        </div>
    );
}

export default Home3;
