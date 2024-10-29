package pl.sebakrys.diving.course.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseMaterialRepo extends JpaRepository<CourseMaterial, Long> {


    @Query("SELECT cm FROM CourseMaterial cm WHERE :url MEMBER OF cm.url")
    Optional<CourseMaterial> findByUrl(@Param("url") String url);

    @Query("SELECT cm FROM CourseMaterial cm JOIN cm.url u WHERE u LIKE CONCAT('%', :url, '%')")
    List<CourseMaterial> findByPartialUrl(@Param("url") String url);

    @Query("SELECT DISTINCT cm FROM CourseMaterial cm JOIN cm.url urls WHERE urls IN :urls")
    List<CourseMaterial> findByUrls(@Param("urls") List<String> urls);

    @Query("SELECT DISTINCT cm FROM CourseMaterial cm JOIN cm.url urls WHERE urls IN :urls")
    List<CourseMaterial> findCourseMaterialsByUrls(@Param("urls") List<String> urls);

    List<CourseMaterial> findByCourseId(Long courseId);

}
