package pl.sebakrys.diving.course.repo;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.course.entity.Course;

import java.util.Optional;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {

    @EntityGraph(attributePaths = "users")
    Optional<Course> findWithUsersById(Long id);

}
