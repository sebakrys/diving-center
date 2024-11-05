import React, { useState } from 'react';
import slate, { pluginFactories } from '@react-page/plugins-slate';
import { ColorPickerField } from '@react-page/editor';
import image from '@react-page/plugins-image';
import spacer from '@react-page/plugins-spacer';
import video from '@react-page/plugins-video';
import html5Video from '@react-page/plugins-html5-video';
import background from '@react-page/plugins-background';
import divider from '@react-page/plugins-divider';
import Editor from '@react-page/editor';

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

// Inicjalizacja innych wtyczek
const backgroundPlugin = background({ defaultPlugin: slatePlugin });
spacer.allowResizeInEditMode = true;

// Definicja cellPlugins
const cellPlugins = [
    slatePlugin,
    image,
    spacer,
    video,
    html5Video,
    divider,
    backgroundPlugin,
];
//TODO dodać zapisywanie
function Home3() {//TODO dodać przesyłanie obrazów
    const [value, setValue] = useState({});

    return (
        <div style={{ background: 'rgba(255, 255, 230, 0.1)', color: 'white' }} className={"pt-5 ms-2 me-2"}>
            <Editor
                cellPlugins={cellPlugins}
                onChange={setValue}
                value={value}
                style={{ color: 'white' }} // Ustawienie białego tekstu w edytorze
            />
        </div>
    );
}

export default Home3;
