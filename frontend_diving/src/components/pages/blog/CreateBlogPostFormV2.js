import React, {useMemo, useState} from "react";
import { Button, Container, Form } from "react-bootstrap";
import BlogService from "../../../service/BlogService";
import SecurityService from "../../../service/SecurityService";
import Editor from "@react-page/editor";
import slate, { pluginFactories } from '@react-page/plugins-slate';
import { ColorPickerField } from '@react-page/editor';
import spacer from "@react-page/plugins-spacer";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import { imagePlugin } from "@react-page/plugins-image";
import background, { ModeEnum } from "@react-page/plugins-background";

import "@react-page/plugins-slate/lib/index.css";
import "@react-page/plugins-image/lib/index.css";
import "@react-page/plugins-spacer/lib/index.css";
import "@react-page/plugins-video/lib/index.css";
import "@react-page/plugins-html5-video/lib/index.css";
import "@react-page/plugins-background/lib/index.css";
import "@react-page/plugins-divider/lib/index.css";
import "@react-page/editor/lib/index.css";
import CONFIG from "../../../config";

const BLOG_REST_URL = CONFIG.REST_URL;

const imageUpload = (setUploadedImagesUrls) => (file, reportProgress) => {

    return new Promise(async (resolve, reject) => {
        try {
            reportProgress(0);

            // Upload the file using BlogService.uploadFiles
            const uploadedUrls = await BlogService.uploadFiles([file]);

            console.log(JSON.stringify(uploadedUrls)+"  "+uploadedUrls[0])

            const uploadedImage = uploadedUrls[0];

            reportProgress(100);

            console.log(`${BLOG_REST_URL}${uploadedImage}`)

            setUploadedImagesUrls((prevImages) => [...prevImages, ...uploadedUrls]);

            // Return the image URL in the format expected by the image plugin
            resolve({ url: `${BLOG_REST_URL}${uploadedImage}` });
        } catch (error) {
            reject(error);
        }
    });
};

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





export const CreateBlogPostFormV2 = ({ fetchPosts }) => {
    const [postTitle, setPostTitle] = useState("");
    const [editorValue, setEditorValue] = useState({});
    const [uploadedImagesUrls, setUploadedImagesUrls] = useState([]);

// Wewnątrz komponentu
    const imageUploadWithState = imageUpload(setUploadedImagesUrls);

    const cellPlugins = [
        slatePlugin,
        spacer,
        imagePlugin({ imageUpload: imageUploadWithState }),
        divider,
        html5Video,
        background({
            imageUpload: imageUploadWithState,
            enabledModes:
                ModeEnum.COLOR_MODE_FLAG |
                ModeEnum.IMAGE_MODE_FLAG |
                ModeEnum.GRADIENT_MODE_FLAG,
        }),
    ];


    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            title: postTitle,
            userUUID: SecurityService.getCurrentUserUUID(),
            content: JSON.stringify(editorValue),
            images: uploadedImagesUrls, // Adresy URL przesłanych obrazów
        };

        // Sending the post to the server
        const response = await BlogService.createPostWithImages(formData);

        if (response.success) {
            console.log("Post utworzony pomyślnie");
            setPostTitle("");
            setEditorValue({});

            fetchPosts();
        }
    };

    return (
        <Container data-bs-theme="dark">
            <h2 className="mt-5 text-white">Tworzenie nowego posta</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="postTitle" className="mb-3">
                    <Form.Label className="mt-3 text-white h4">Tytuł posta</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Wprowadź tytuł"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        maxLength={255}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="postContent" className="mb-3">
                    <Form.Label className="mt-3 text-white h4">Treść posta</Form.Label>
                    <div
                        style={{ background: "rgba(255, 255, 240, 0.1)", color: "white" }}
                        className="pt-5 ms-2 me-2"
                    >
                        <Editor
                            cellPlugins={cellPlugins}
                            onChange={setEditorValue}
                            value={editorValue}
                            style={{ color: "white" }}
                        />
                    </div>
                </Form.Group>

                <Button type="submit" variant="primary">
                    Zapisz post
                </Button>
            </Form>
        </Container>
    );
};
