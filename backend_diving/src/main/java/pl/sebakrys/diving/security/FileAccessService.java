package pl.sebakrys.diving.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.repo.CourseMaterialRepo;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.course.service.CourseMaterialService;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;
import pl.sebakrys.diving.users.service.UserService;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Component
public class FileAccessService {


    private CourseMaterialRepo courseMaterialRepository;


    private CourseRepo courseRepository;

    private UserRepo userRepository;

    private UserSecurityService userSecurityService;

    @Autowired
    public FileAccessService(CourseMaterialRepo courseMaterialRepository, CourseRepo courseRepository, UserRepo userRepository, UserSecurityService userSecurityService) {
        this.courseMaterialRepository = courseMaterialRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.userSecurityService = userSecurityService;
    }

    @Transactional
    public boolean hasAccessToVideoFile(HttpServletRequest request) {

        // Pobierz użytkownika na podstawie tokena z żądania
        User user = userSecurityService.getUserByAuthTokenRequest(request);
        if (user == null) {
            //System.err.println("False");
            return false;
        }

        // Pobierz URI żądania
        String requestURI = request.getRequestURI();

        // Wyodrębnij ścieżkę katalogu z URI, usuwając nazwę pliku
        Path path = Paths.get(requestURI);
        String directoryPath = path.getParent().toString().replace("\\", "/");

        // Znajdź materiały kursu, które pasują do częściowego URL
        List<CourseMaterial> courseMaterialList = courseMaterialRepository.findByPartialUrl(directoryPath);

        // Sprawdź, czy użytkownik ma dostęp do któregokolwiek z materiałów
        boolean hasAccess = courseMaterialList.stream()
                .filter(cm -> cm.getCourse() != null)
                .anyMatch(cm -> {
                    Course course = cm.getCourse();
                    return course.getUsers().contains(user)
                            || user.hasRole("ROLE_EMPLOYEE")
                            || user.hasRole("ROLE_ADMIN");
                });

        //System.err.println(hasAccess ? "True" : "False");
        return hasAccess;
    }



    @Transactional
    public boolean hasAccessToFile(HttpServletRequest request) {
        //System.out.println("request: "+request.toString());
        //System.out.println("request.getHeader(\"Authorization\");: "+request.getHeader("Authorization"));

        User user = userSecurityService.getUserByAuthTokenRequest(request);
        //System.err.println("user.name: "+user.getEmail());

        String requestURI = request.getRequestURI();
        //System.err.println("requestURI: "+requestURI);

        Optional<CourseMaterial> courseMaterialOptional =  courseMaterialRepository.findByUrl(requestURI);
        if(courseMaterialOptional.isPresent() && user!=null){
            Optional<Course> optionalCourse = courseRepository.findById(courseMaterialOptional.get().getCourse().getId());
            if(
                    optionalCourse.isPresent()
                            && (
                            optionalCourse.get().getUsers().contains(user)
                                    || user.hasRole("ROLE_EMPLOYEE")
                                    || user.hasRole("ROLE_ADMIN")
                    )
            ){
                //System.err.println("True");
                return true;
            }
        }
        //System.err.println("False");
        return false;
    }
}
