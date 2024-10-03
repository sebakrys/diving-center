package pl.sebakrys.diving.blog.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.blog.entity.BlogPostImage;

@Repository
public interface BlogPostImageRepo extends JpaRepository<BlogPostImage, Long> {

}