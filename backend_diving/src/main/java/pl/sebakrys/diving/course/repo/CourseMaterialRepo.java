package pl.sebakrys.diving.course.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;

import java.util.List;

@Repository
public interface CourseMaterialRepo extends JpaRepository<CourseMaterial, Long> {

    List<CourseMaterial> findByCourseId(Long courseId);

}
