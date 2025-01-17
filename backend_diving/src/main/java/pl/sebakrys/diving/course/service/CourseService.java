package pl.sebakrys.diving.course.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.course.dto.CourseDTO;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.repo.CourseMaterialRepo;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.security.UserSecurityService;
import pl.sebakrys.diving.users.dto.UserDto;
import pl.sebakrys.diving.users.dto.UserNamesAndIDDto;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.RoleRepo;
import pl.sebakrys.diving.users.repo.UserRepo;
import pl.sebakrys.diving.users.service.UserService;


import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepo courseRepository;

    @Autowired
    private CourseMaterialRepo courseMaterialRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private UserSecurityService userSecurityService;

    @Autowired
    private RoleRepo roleRepo;

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> getCourse(Long id, HttpServletRequest request) {
        Long userId = userSecurityService.getUserIdByAuthTokenRequest(request);
        User user = userRepository.findById(userId).orElseThrow();

        System.out.println("user.getRoles().toString(): "+user.getRoles().toString());
        System.out.println("user.hasRole(\"ROLE_ADMIN\"): "+user.hasRole("ROLE_ADMIN"));

        Optional<Course> optionalCourse = courseRepository.findById(id);


        if(
                optionalCourse.isPresent()
                        && (
                                optionalCourse.get().getUsers().contains(user)
                                        || user.hasRole("ROLE_EMPLOYEE")
                                        || user.hasRole("ROLE_ADMIN")
                )
        ){
            return optionalCourse;
        }



        return Optional.empty();
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }



    @Transactional
    public List<UserNamesAndIDDto> getUsersForCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Kurs nie znaleziony o ID: " + courseId));

        // Uzyskanie użytkowników (Lazy loading działa tutaj, ponieważ jesteśmy w transakcji)
        List<UserNamesAndIDDto> userDtos = course.getUsers().stream()
                .map(user -> new UserNamesAndIDDto(
                        user.getUuid(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail()
                ))
                .collect(Collectors.toList());

        return userDtos;
    }

    public List<Course> getCoursesForUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return courseRepository.findAll().stream()
                .filter(course -> course.getUsers().contains(user))
                .collect(Collectors.toList());
    }

    public List<Course> getCoursesForUser(UUID userUUId) {
        User user = userRepository.findByUuid(userUUId).orElseThrow();
        return courseRepository.findAll().stream()
                .filter(course -> course.getUsers().contains(user))
                .collect(Collectors.toList());
    }

    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id).orElseThrow();
        course.setName(courseDetails.getName());
        course.setDescription(courseDetails.getDescription());
        return courseRepository.save(course);
    }

    @Transactional
    public CourseDTO deleteCourse(Long id) {
        Optional<Course> courseToDeleteOptional = courseRepository.findById(id);
        if (courseToDeleteOptional.isEmpty()) return null;
        Course course = courseToDeleteOptional.get();

        List<CourseMaterial> courseMaterials = courseMaterialRepository.findByCourseId(id);
        courseMaterialRepository.deleteAll(courseMaterials);

        courseRepository.deleteById(id);
        return new CourseDTO(course);
    }


    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Transactional
    public UserNamesAndIDDto addUserToCourse(Long courseId, UUID userUUId) {
        logger.info("Dodawanie użytkownika o ID {} do kursu o ID {}", userUUId, courseId);

        // Pobranie kursu z bazy danych
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Kurs nie znaleziony o ID: " + courseId));

        // Pobranie użytkownika z bazy danych
        User user = userRepository.findByUuid(userUUId)
                .orElseThrow(() -> new EntityNotFoundException("Użytkownik nie znaleziony o ID: " + userUUId));

        logger.debug("Znaleziony użytkownik: {}", user);

        // Sprawdzenie, czy użytkownik już jest przypisany do kursu
        if (!course.getUsers().contains(user)) {
            logger.info("Dodawanie użytkownika do kursu");

            // Dodanie użytkownika do kursu
            course.getUsers().add(user);


            // Zapisanie kursu (jeśli relacja jest zarządzana przez kurs)
            courseRepository.save(course);

            logger.info("Użytkownik dodany do kursu");
        } else {
            logger.warn("Użytkownik o ID {} jest już zapisany na kurs o ID {}", userUUId, courseId);
            throw new IllegalArgumentException("Użytkownik jest już zapisany na kurs");
        }

        return new UserNamesAndIDDto(
                user.getUuid(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }


    public Set<User> removeUserFromCourse(Long courseId, UUID userUUId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User user = userRepository.findByUuid(userUUId).orElseThrow();
        course.getUsers().remove(user);
        courseRepository.save(course);
        return course.getUsers();
    }
}
