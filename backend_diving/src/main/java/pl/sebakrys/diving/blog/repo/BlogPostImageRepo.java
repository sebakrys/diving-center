package pl.sebakrys.diving.blog.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.blog.entity.BlogPost;
import pl.sebakrys.diving.blog.entity.BlogPostImage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BlogPostImageRepo extends JpaRepository<BlogPostImage, Long> {

    List<BlogPostImage> findByPostIsNullAndCreatedAtBefore(LocalDateTime dateTime);

    void deleteByPostIsNullAndCreatedAtBefore(LocalDateTime dateTime);

    Optional<BlogPostImage> findByUrl(String Url);

    List<BlogPostImage> findByPost(BlogPost post);

    List<BlogPostImage> findByPostId(Long postId);


}