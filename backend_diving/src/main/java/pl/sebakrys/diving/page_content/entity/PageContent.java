package pl.sebakrys.diving.page_content.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.blog.entity.BlogPostImage;
import pl.sebakrys.diving.users.entity.User;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "pages_content")
@Data
public class PageContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(length = 255)
    private String name;

    @Column(length = 100000)
    private String content;

    private LocalDateTime publishDate;

}
