package pl.sebakrys.diving.blog.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.blog.entity.BlogPost;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepo extends JpaRepository<BlogPost, Long> {

    List<BlogPost> findAllByOrderByIdDesc();
    @Query("SELECT bp FROM BlogPost bp LEFT JOIN FETCH bp.images")
    List<BlogPost> findAllWithImages();

    @Query("SELECT bp FROM BlogPost bp LEFT JOIN FETCH bp.images WHERE bp.id = :postId")
    Optional<BlogPost> findByIdWithImages(@Param("postId") Long postId);

}
