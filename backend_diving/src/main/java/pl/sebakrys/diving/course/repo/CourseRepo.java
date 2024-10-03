package pl.sebakrys.diving.course.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.Course;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {

}
