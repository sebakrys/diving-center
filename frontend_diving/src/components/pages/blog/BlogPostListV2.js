import React, { useState, useMemo } from "react";
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

export const BlogPostsListV2 = ({ posts, fetchPosts }) => {
    const [editingPosts, setEditingPosts] = useState({});

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
        setEditingPosts((prevState) => {
            const newState = { ...prevState };
            delete newState[postId];
            return newState;
        });
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

    return (
        <Container className="mt-1">
            {posts.map((post) => {
                const isEditing = editingPosts.hasOwnProperty(post.id);
                const editingData = editingPosts[post.id];
                const postCellPlugins = [
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

                let content;
                if (isEditing) {
                    content = (
                        <div>
                            <Form.Group controlId={`editPostTitle-${post.id}`} className="mb-3">
                                <Form.Label>Tytuł posta</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Wprowadź tytuł"
                                    value={editingData.editedTitle}
                                    onChange={(e) => handleTitleChange(post.id, e.target.value)}
                                    maxLength={255}
                                    required
                                />
                            </Form.Group>
                            <Editor
                                cellPlugins={postCellPlugins}
                                onChange={(value) => handleEditorChange(post.id, value)}
                                value={editingData.editedEditorValue}
                                style={{ color: "black" }}
                            />
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
                        </div>
                    );
                } else {
                    content = isJsonString(post.content) ? (
                        <Editor
                            cellPlugins={postCellPlugins}
                            value={JSON.parse(post.content)}
                            readOnly
                        />
                    ) : (
                        <Card.Text>{post.content}</Card.Text>
                    );
                }

                return (
                    <Card
                        key={post.id}
                        className="mt-5 mb-4 bg-dark text-white"
                        style={{
                            opacity: "90%",
                            borderRadius: "15px",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <Card.Subtitle className="text-secondary">
                                        {new Date(post.publishDate).toLocaleDateString("pl-PL", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Card.Subtitle>
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    {isEditing ? (
                                        <Form.Control
                                            type="text"
                                            placeholder="Wprowadź tytuł"
                                            value={editingData.editedTitle}
                                            onChange={(e) => handleTitleChange(post.id, e.target.value)}
                                            maxLength={255}
                                            required
                                            className="h4 text-center"
                                        />
                                    ) : (
                                        <Card.Title style={{ fontSize: "1.8rem", marginBottom: 0 }}>
                                            {post.title}
                                        </Card.Title>
                                    )}
                                </div>
                                <div>
                                    <Card.Subtitle className="text-secondary">
                                        {post.author.firstName} {post.author.lastName}
                                    </Card.Subtitle>
                                </div>
                            </div>
                            {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                                <div className="d-flex justify-content-between mt-3">
                                    {!isEditing && (
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
                            <Card.Text className="mt-3">{content}</Card.Text>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    pointerEvents: "none",
                                    boxShadow: "inset 0 0 25px rgba(0, 0, 0, 1)",
                                }}
                            ></div>
                        </Card.Body>
                    </Card>
                );
            })}
        </Container>
    );
};
