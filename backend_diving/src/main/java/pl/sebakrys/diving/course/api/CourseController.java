package pl.sebakrys.diving.course.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.service.CourseService;
import pl.sebakrys.diving.users.dto.UserNamesAndIDDto;
import pl.sebakrys.diving.users.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping("/")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return ResponseEntity.ok(createdCourse);
    }

    @GetMapping("/{id}")//TODO jesli user nalezy do kursu
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        Optional<Course> course = courseService.getCourse(id);
        return course.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> allCourses = courseService.getAllCourses();
        return ResponseEntity.ok(allCourses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Course>> getCoursesForUser(@PathVariable Long userId) {
        List<Course> userCourses = courseService.getCoursesForUser(userId);
        return ResponseEntity.ok(userCourses);
    }

    @GetMapping("/{courseId}/users")
    public ResponseEntity<List<UserNamesAndIDDto>> getUsersForCourse(@PathVariable Long courseId) {
        List<UserNamesAndIDDto> usersNamesAndIDDtos = courseService.getUsersForCourse(courseId);
        return ResponseEntity.ok(usersNamesAndIDDtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        Course updatedCourse = courseService.updateCourse(id, course);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{courseId}/users/{userId}")
    public ResponseEntity<UserNamesAndIDDto> addUserToCourse(@PathVariable Long courseId, @PathVariable Long userId) {
        UserNamesAndIDDto updatedUser = courseService.addUserToCourse(courseId, userId);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{courseId}/users/{userId}")
    public ResponseEntity<Set<User>> removeUserFromCourse(@PathVariable Long courseId, @PathVariable Long userId) {
        Set<User> updatedUsers = courseService.removeUserFromCourse(courseId, userId);
        return ResponseEntity.ok(updatedUsers);
    }
}
