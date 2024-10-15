package pl.sebakrys.diving.blog.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_post_images")
@Data
public class BlogPostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    private String thumbnail_url;

    private LocalDateTime createdAt;

    @ManyToOne
    private BlogPost post;
}
