package pl.sebakrys.diving.blog.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.blog.entity.BlogPost;

@Repository
public interface BlogPostRepo extends JpaRepository<BlogPost, Long> {

}
