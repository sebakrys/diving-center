package pl.sebakrys.diving.blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.users.entity.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "blog_posts")
@Data
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    private LocalDateTime publishDate;

    @ManyToOne
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<BlogPostImage> images = new HashSet<>();
}

