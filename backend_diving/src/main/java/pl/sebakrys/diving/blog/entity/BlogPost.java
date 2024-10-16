package pl.sebakrys.diving.blog.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import pl.sebakrys.diving.users.entity.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "blog_posts")
@Getter
@Setter
@EqualsAndHashCode(exclude = {"images", "author"})
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(length = 255)
    private String title;

    @Column(length = 3500)
    private String content;

    private LocalDateTime publishDate;

    @ManyToOne
    private User author;

    @OneToMany(mappedBy = "post", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<BlogPostImage> images = new HashSet<>();


}

