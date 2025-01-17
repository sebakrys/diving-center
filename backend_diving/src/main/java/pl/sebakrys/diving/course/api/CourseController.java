package pl.sebakrys.diving.course.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.course.dto.CourseDTO;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.service.CourseService;
import pl.sebakrys.diving.users.dto.UserNamesAndIDDto;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;


    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return ResponseEntity.ok(createdCourse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id, HttpServletRequest request) {
        Optional<Course> course = courseService.getCourse(id, request);
        return course.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> allCourses = courseService.getAllCourses();
        return ResponseEntity.ok(allCourses);
    }

    @GetMapping("/user/email/{userEmail}")
    public ResponseEntity<List<Course>> getCoursesForUserEmail(@PathVariable String userEmail) {
        List<Course> userCourses = courseService.getCoursesForUserEmail(userEmail);
        return ResponseEntity.ok(userCourses);
    }

    @GetMapping("/user/{userUUID}")
    public ResponseEntity<List<Course>> getCoursesForUserUUId(@PathVariable UUID userUUID) {
        List<Course> userCourses = courseService.getCoursesForUser(userUUID);
        return ResponseEntity.ok(userCourses);
    }

    @GetMapping("/{courseId}/users")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<UserNamesAndIDDto>> getUsersForCourse(@PathVariable Long courseId) {
        List<UserNamesAndIDDto> usersNamesAndIDDtos = courseService.getUsersForCourse(courseId);
        return ResponseEntity.ok(usersNamesAndIDDtos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        Course updatedCourse = courseService.updateCourse(id, course);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<CourseDTO> deleteCourse(@PathVariable Long id) {
        CourseDTO deletedCourse = courseService.deleteCourse(id);
        if(deletedCourse==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(deletedCourse);
    }

    @PostMapping("/{courseId}/users/{userUUId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<UserNamesAndIDDto> addUserToCourse(@PathVariable Long courseId, @PathVariable UUID userUUId) {
        UserNamesAndIDDto updatedUser = courseService.addUserToCourse(courseId, userUUId);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{courseId}/users/{userUUId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Set<User>> removeUserFromCourse(@PathVariable Long courseId, @PathVariable UUID userUUId) {
        Set<User> updatedUsers = courseService.removeUserFromCourse(courseId, userUUId);
        return ResponseEntity.ok(updatedUsers);
    }
}
