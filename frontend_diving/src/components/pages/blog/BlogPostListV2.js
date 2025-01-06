import React, {useState, useMemo, useEffect} from "react";
import { Button, Container, Card, Form } from "react-bootstrap";
import BlogService from "../../../service/BlogService";
import SecurityService from "../../../service/SecurityService";
import Editor from "@react-page/editor";
import slate, { pluginFactories } from "@react-page/plugins-slate";
import { ColorPickerField } from "@react-page/editor";
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

const cellSpacingConfig = {
    x: 20, // Odstęp poziomy między blokami
    y: 20, // Odstęp pionowy między blokami
};

export const BlogPostsListV2 = ({ posts, fetchPosts }) => {
    const [editingPosts, setEditingPosts] = useState({});
    const [cellPluginsMap, setCellPluginsMap] = useState({});

    // Function to handle image upload with access to post-specific state
    const createImageUploadHandler = (postId) => (file, reportProgress) => {
        return new Promise(async (resolve, reject) => {
            try {
                reportProgress(0);
                const uploadedUrls = await BlogService.uploadFiles([file]);
                const uploadedImage = uploadedUrls[0];
                reportProgress(100);

                // Update the uploaded images URLs state for the specific post
                setEditingPosts((prevState) => ({
                    ...prevState,
                    [postId]: {
                        ...prevState[postId],
                        uploadedImagesUrls: [
                            ...(prevState[postId].uploadedImagesUrls || []),
                            uploadedImage,
                        ],
                    },
                }));
                resolve({ url: `${BLOG_REST_URL}${uploadedImage}` });
            } catch (error) {
                reject(error);
            }
        });
    };

    const ColorPlugin = pluginFactories.createComponentPlugin({
        addHoverButton: true,
        addToolbarButton: true,
        type: "SetColor",
        object: "mark",
        icon: <span>Color</span>,
        label: "Set Color",
        Component: "span",
        getStyle: ({ color }) => ({ color }),
        controls: {
            type: "autoform",
            schema: {
                type: "object",
                required: ["color"],
                properties: {
                    color: {
                        uniforms: {
                            component: ColorPickerField,
                        },
                        default: "rgba(255, 255, 255, 1)", // Default white color
                        type: "string",
                    },
                },
            },
        },
    });

    const slatePlugin = slate((config) => ({
        ...config,
        customStyleMap: {
            defaultColor: { color: "white" }, // Default text color
        },
        placeholder: {
            color: "rgba(255, 255, 255, 0.5)", // Placeholder color
            text: "Write here", // Placeholder text
        },
        plugins: {
            ...config.plugins,
            formatting: {
                color: ColorPlugin,
            },
        },
    }));


    // Utility function to check if content is valid JSON
    function isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    const handleEditPost = (post) => {
        setEditingPosts((prevState) => ({
            ...prevState,
            [post.id]: {
                editedTitle: post.title,
                editedEditorValue: isJsonString(post.content)
                    ? JSON.parse(post.content)
                    : {},
                uploadedImagesUrls: [],
            },
        }));
    };

    const handleCancelEdit = (postId) => {
        setEditingPosts((prevState) => {
            const newState = { ...prevState };
            delete newState[postId];
            return newState;
        });
    };

    const handleSavePost = async (postId) => {
        const editingData = editingPosts[postId];
        const updatedPost = {
            title: editingData.editedTitle,
            userUUID: SecurityService.getCurrentUserUUID(),
            content: JSON.stringify(editingData.editedEditorValue),
            images: editingData.uploadedImagesUrls, // New uploaded images
        };

        await BlogService.editPost(postId, updatedPost);
        handleCancelEdit(postId);
        setEditingPosts((prevState) => {
            const newState = { ...prevState };
            delete newState[postId];
            return newState;
        });
        handleCancelEdit(postId);// z jakiegoś powodu musi być to 2 razy tak jak jest
        fetchPosts(); // Refresh posts
    };

    const handleTitleChange = (postId, newTitle) => {
        setEditingPosts((prevState) => ({
            ...prevState,
            [postId]: {
                ...prevState[postId],
                editedTitle: newTitle,
            },
        }));
    };

    const handleEditorChange = (postId, newEditorValue) => {
        setEditingPosts((prevState) => ({
            ...prevState,
            [postId]: {
                ...prevState[postId],
                editedEditorValue: newEditorValue,
            },
        }));
    };

    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć tego posta?");
        if (confirmed) {
            await BlogService.deletePost(postId);
            fetchPosts();
        }
    };

    // Base cell plugins configuration with placeholders for imageUpload handlers
    const baseCellPlugins = [
        slatePlugin,
        spacer,
        divider,
        html5Video,
    ];


    // Przygotowanie `cellPlugins` dla każdego `postId` przy pierwszym renderze lub aktualizacji `posts`
    useEffect(() => {
        const newCellPluginsMap = posts.reduce((acc, post) => {
            acc[post.id] = [
                ...baseCellPlugins,
                imagePlugin({
                    imageUpload: createImageUploadHandler(post.id),
                }),
                background({
                    imageUpload: createImageUploadHandler(post.id),
                    enabledModes:
                        ModeEnum.COLOR_MODE_FLAG |
                        ModeEnum.IMAGE_MODE_FLAG |
                        ModeEnum.GRADIENT_MODE_FLAG,
                }),
            ];
            return acc;
        }, {});

        setCellPluginsMap(newCellPluginsMap);
    }, [posts]);


    return (
        <Container className="mt-1">
            {posts.map((post) => {
                const isEditing = editingPosts.hasOwnProperty(post.id);
                const editingData = editingPosts[post.id] || {};
                const postCellPlugins = cellPluginsMap[post.id] || baseCellPlugins;

                return (
                    <Card
                        key={post.id}
                        className="mt-5 mb-4 bg-dark text-white"
                        border="dark"
                        style={{ opacity: "90%" }}
                    >
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center mb-1 mt-1">
                                <Card.Subtitle className="text-secondary">
                                    {new Date(post.publishDate).toLocaleDateString("pl-PL", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </Card.Subtitle>
                                <Card.Subtitle className="text-secondary">
                                    {post.author.firstName} {post.author.lastName}
                                </Card.Subtitle>
                            </div>

                            {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                                <div className="d-flex justify-content-between mt-3">
                                    {isEditing ? (
                                        <div className="mt-2">
                                            <Button variant="primary" onClick={() => handleSavePost(post.id)}>
                                                Zapisz zmiany
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleCancelEdit(post.id)}
                                                className="ms-2"
                                            >
                                                Anuluj
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline-light"
                                            onClick={() => handleEditPost(post)}
                                        >
                                            Edytuj
                                        </Button>
                                    )}
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Usuń
                                    </Button>
                                </div>
                            )}
                        </Card.Header>

                        <Card.Body>
                            {isEditing && (
                                <Form.Group controlId={`editPostTitle-${post.id}`} className="mb-3">
                                    <Form.Label>Tytuł posta</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Wprowadź tytuł"
                                        value={editingData.editedTitle || ""}
                                        onChange={(e) => handleTitleChange(post.id, e.target.value)}
                                        maxLength={255}
                                        required
                                    />
                                </Form.Group>
                            )}
                            <Editor
                                cellPlugins={postCellPlugins}
                                value={isEditing ? editingData.editedEditorValue : JSON.parse(post.content || "{}")}
                                onChange={(value) => handleEditorChange(post.id, value)}
                                readOnly={!isEditing}
                                cellSpacing={cellSpacingConfig}
                            />
                        </Card.Body>
                    </Card>
                );
            })}
        </Container>
    );
};
