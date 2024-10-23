package pl.sebakrys.diving.course.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.users.dto.UserDto;
import pl.sebakrys.diving.users.dto.UserNamesAndIDDto;
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
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail()
                ))
                .collect(Collectors.toList());

        return userDtos;
    }

    public List<Course> getCoursesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
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

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }


    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Transactional
    public UserNamesAndIDDto addUserToCourse(Long courseId, Long userId) {
        logger.info("Dodawanie użytkownika o ID {} do kursu o ID {}", userId, courseId);

        // Pobranie kursu z bazy danych
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Kurs nie znaleziony o ID: " + courseId));

        // Pobranie użytkownika z bazy danych
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Użytkownik nie znaleziony o ID: " + userId));

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
            logger.warn("Użytkownik o ID {} jest już zapisany na kurs o ID {}", userId, courseId);
            throw new IllegalArgumentException("Użytkownik jest już zapisany na kurs");
        }

        return new UserNamesAndIDDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }


    public Set<User> removeUserFromCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        course.getUsers().remove(user);
        courseRepository.save(course);
        return course.getUsers();
    }
}
