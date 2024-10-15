package pl.sebakrys.diving.blog.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.blog.entity.BlogPostImage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostImageRepo extends JpaRepository<BlogPostImage, Long> {

    List<BlogPostImage> findByPostIsNullAndCreatedAtBefore(LocalDateTime dateTime);

    void deleteByPostIsNullAndCreatedAtBefore(LocalDateTime dateTime);

    Optional<BlogPostImage> findByUrl(String Url);

}