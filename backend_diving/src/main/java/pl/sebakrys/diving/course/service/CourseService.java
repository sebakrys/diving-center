package pl.sebakrys.diving.course.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;


import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepo courseRepository;

    @Autowired
    private UserRepo userRepository;

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> getCourse(Long id) {
        return courseRepository.findById(id);
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return courseRepository.findAll().stream()
                .filter(course -> course.getUser().contains(user))
                .collect(Collectors.toList());
    }

    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id).orElseThrow();
        course.setName(courseDetails.getName());
        course.setDescription(courseDetails.getDescription());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Set<User> addUserToCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        course.getUser().add(user);
        courseRepository.save(course);
        return course.getUser();
    }

    public Set<User> removeUserFromCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        course.getUser().remove(user);
        courseRepository.save(course);
        return course.getUser();
    }
}
