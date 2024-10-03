package pl.sebakrys.diving.blog.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "blog_post_images")
@Data
public class BlogPostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @ManyToOne
    private BlogPost post;
}
