import React, { useState } from 'react';
import slate from '@react-page/plugins-slate';
import image from '@react-page/plugins-image';
import spacer from '@react-page/plugins-spacer';
import video from '@react-page/plugins-video';
import html5Video from '@react-page/plugins-html5-video';
import background from '@react-page/plugins-background';
import divider from '@react-page/plugins-divider';
import Editor from '@react-page/editor';
import '@react-page/editor/lib/index.css';
import '@react-page/plugins-slate/lib/index.css';


const backgroundPlugin = background({ defaultPlugin: slate() });

const plugins = {
    content: [slate(), image, spacer, video, html5Video, background],
};


function Home3() {
    const [value, setValue] = useState({});
    const cellPlugins = [
        slate(),
        image,
        spacer,
        video,
        html5Video,
        divider,
        backgroundPlugin,
    ];

    return (
        <div style={{ background: 'white' }}>
            <Editor cellPlugins={cellPlugins} value={value} onChange={setValue} />
        </div>
    );
}

export default Home3;
