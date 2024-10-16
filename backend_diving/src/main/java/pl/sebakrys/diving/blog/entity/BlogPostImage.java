package pl.sebakrys.diving.blog.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_post_images")
@Getter
@Setter
@EqualsAndHashCode(exclude = {"post"})
public class BlogPostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    private String thumbnail_url;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonBackReference
    private BlogPost post;
}
