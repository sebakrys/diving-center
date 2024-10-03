package pl.sebakrys.diving.course.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.CourseEnrollment;

@Repository
public interface CourseEnrollmentRepo extends JpaRepository<CourseEnrollment, Long> {

}
