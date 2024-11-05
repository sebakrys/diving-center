import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Import wtyczek
import pluginBlocksBasic from 'grapesjs-blocks-basic';
import pluginNavbar from 'grapesjs-navbar';
import pluginFlexbox from 'grapesjs-blocks-flexbox';

import pluginForms from 'grapesjs-plugin-forms';
import pluginExport from 'grapesjs-plugin-export';
import pluginCountdown from 'grapesjs-component-countdown';
import pluginStyleBg from 'grapesjs-style-bg';

const GrapesEditor = () => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current) {
            editorRef.current = grapesjs.init({
                container: '#editor',
                height: '100vh',
                width: 'auto',
                fromElement: true,
                storageManager: {
                    type: 'local',
                    autosave: true,
                    autoload: true,
                    stepsBeforeSave: 1,
                },
                plugins: [
                    pluginBlocksBasic,
                    pluginNavbar,
                    pluginFlexbox,
                    pluginForms,
                    pluginExport,
                    pluginCountdown,
                    pluginStyleBg,
                ],
                pluginsOpts: {
                    gjsPresetWebpage: {},
                    pluginBlocksBasic: {},
                    pluginNavbar: {},
                    pluginFlexbox: {},
                    pluginBlocksBootstrap: {},
                    pluginForms: {},
                    pluginExport: {},
                    pluginCountdown: {},
                    pluginStyleBg: {},
                },
            });

            const editor = editorRef.current;

            // Opcjonalnie: dostosowanie paneli i narzędzi
            editor.Panels.addPanel({
                id: 'panel-top',
                el: '.panel__top',
            });

            editor.Panels.addPanel({
                id: 'basic-actions',
                el: '.panel__basic-actions',
                buttons: [
                    {
                        id: 'visibility',
                        active: true,
                        className: 'btn-toggle-borders',
                        label: '<u>B</u>',
                        command: 'sw-visibility',
                    },
                    {
                        id: 'export',
                        className: 'btn-open-export',
                        label: 'Eksport',
                        command: 'export-template',
                        context: 'export-template',
                    },
                    {
                        id: 'show-json',
                        className: 'btn-show-json',
                        label: 'JSON',
                        context: 'show-json',
                        command(editor) {
                            editor.Modal.setTitle('Components JSON')
                                .setContent(
                                    `<textarea style="width:100%; height: 250px;">
                                    ${JSON.stringify(editor.getComponents())}
                                    </textarea>`
                                )
                                .open();
                        },
                    },
                ],
            });
        }
    }, []);

    return (
        <div>
            <div className="panel__top"></div>
            <div className="panel__basic-actions"></div>
            <div id="editor" style={{ border: '1px solid #ccc' }} />
        </div>
    );
};

export default GrapesEditor;
