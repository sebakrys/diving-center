import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pl';
import {Button} from "react-bootstrap";
import SecurityService from "../../../service/SecurityService";
import {BlogPostsList, CreateBlogPostForm} from "./BlogForms";
import BlogService from "../../../service/BlogService";
import {BlogPostsListV2} from "./BlogPostListV2";
import {CreateBlogPostFormV2} from "./CreateBlogPostFormV2";

const localizer = momentLocalizer(moment);

class Blog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [{"title":"Lorem Ipsum","content":"{}","publishDate":"2024-10-16T20:32:31.944846","author":{"id":123,"firstName":"","lastName":"","email":"","active":true}},
                {"title":"Lorem Ipsum","content":"{}","publishDate":"2024-10-16T20:32:31.944846","author":{"id":123,"firstName":"","lastName":"","email":"","active":true}},
                {"title":"Lorem Ipsum","content":"{}","publishDate":"2024-10-16T20:32:31.944846","author":{"id":123,"firstName":"","lastName":"","email":"","active":true}},
                {"title":"Lorem Ipsum","content":"{}","publishDate":"2024-10-16T20:32:31.944846","author":{"id":123,"firstName":"","lastName":"","email":"","active":true}}],
            roles: []
        };
    }

    componentDidMount() {
        const month = moment().month() + 1;
        const year = moment().year();

        this.fetchPosts();

    }


    fetchPosts = async () => {
        const allPosts = await BlogService.getAllPosts();
        this.setState({ posts: allPosts });
        console.log(JSON.stringify(allPosts))
    };


    render() {
        return (
            <div>
                {SecurityService.isUserInRole(["ROLE_ADMIN", "ROLE_EMPLOYEE"]) && (
                    <div>
                        <div>
                            <CreateBlogPostFormV2 fetchPosts={this.fetchPosts}/>
                        </div>
                        <h2 className="text-white mt-5 mb-4">Lista postów na blogu</h2>
                    </div>
                )}
                <BlogPostsListV2 posts={this.state.posts} fetchPosts={this.fetchPosts}/>
            </div>
        );
    }
}

export default Blog;
