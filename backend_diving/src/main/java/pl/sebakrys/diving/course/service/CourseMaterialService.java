package pl.sebakrys.diving.course.service;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.repo.CourseMaterialRepo;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.RoleRepo;
import pl.sebakrys.diving.users.repo.UserRepo;
import pl.sebakrys.diving.users.service.UserService;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseMaterialService {

    @Value("${root.upload.path}")
    private String rootUploadPath;

    public static final String IMAGES_COURSE_ACCES_DIRECTORY = "/course_materials/images/";
    public static final String VIDEOS_COURSE_ACCES_DIRECTORY = "/course_materials/videos/";
    public static final String FILES_COURSE_ACCES_DIRECTORY = "/course_materials/files/";

    private String uploadPath;




    @Autowired
    private CourseMaterialRepo courseMaterialRepository;

    @Autowired
    private CourseRepo courseRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepo roleRepo;


    @PostConstruct
    public void init() {
        createUploadDirectoryIfNotExists(rootUploadPath+IMAGES_COURSE_ACCES_DIRECTORY);  // Tworzenie katalogu po ustawieniu ścieżki
        createUploadDirectoryIfNotExists(rootUploadPath+VIDEOS_COURSE_ACCES_DIRECTORY);  // Tworzenie katalogu po ustawieniu ścieżki
        createUploadDirectoryIfNotExists(rootUploadPath+FILES_COURSE_ACCES_DIRECTORY);  // Tworzenie katalogu po ustawieniu ścieżki
    }

    public void createUploadDirectoryIfNotExists(String path){

        System.out.println(path);
        Path uploadDirectory = Paths.get(path);

        // Upewnij się, że katalog istnieje, jeśli nie, stwórz go
        if (!Files.exists(uploadDirectory)) {
            try {
                Files.createDirectories(uploadDirectory);
            } catch (IOException e) {
                throw new RuntimeException("Nie można utworzyć katalogu dla plików!", e);
            }
        }
    }



    public CourseMaterial addMaterial(Long courseId, CourseMaterial material) {
        // Znajdź kurs na podstawie ID
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        // Inicjalizacja listy url, jeśli jest null
        if (material.getUrl() == null) {
            material.setUrl(new ArrayList<>()); // Inicjalizujemy pustą listę
        }

        System.out.println("material.getUrl(): "+material.getUrl().toString());

        // Sprawdzenie, czy materiał zawiera URL i czy typ nie jest "TEXT"
        if (!material.getUrl().isEmpty() && !material.getType().equals("TEXT")) {
            Optional<CourseMaterial> courseMaterialOptional = courseMaterialRepository.findByUrl(material.getUrl().get(0));

            // Jeśli znaleziono materiał, nadpisz jego listę URL-i
            if (courseMaterialOptional.isPresent()) {
                CourseMaterial courseMaterial = courseMaterialOptional.get();

                // Uaktualnienie pól materiału
                courseMaterial.setType(material.getType());
                courseMaterial.setTitle(material.getTitle());
                courseMaterial.setContent(material.getContent());
                courseMaterial.setCourse(course);

                System.out.println("courseMaterial.getUrl: "+courseMaterial.getUrl().toString());

                // Nadpisanie istniejącej listy URL-i nową listą
                courseMaterial.setUrl(material.getUrl());
                System.out.println("courseMaterial.getUrl{2}: "+courseMaterial.getUrl().toString());

                // Zapisz zaktualizowany materiał
                return courseMaterialRepository.save(courseMaterial);
            }
        }

        // W przypadku typu TEXT, ustaw pustą listę URL-i
        if (material.getType().equals("TEXT")) {
            material.setUrl(new ArrayList<>()); // Pusta lista zamiast null
        }

        // Ustaw kurs dla materiału i zapisz nowy materiał
        material.setCourse(course);
        return courseMaterialRepository.save(material);
    }





    public List<CourseMaterial> getMaterialsForCourse(Long courseId, HttpServletRequest request) {
        Long userId = userService.getUserIdByAuthTokenRequest(request);
        User user = userRepository.findById(userId).orElseThrow();

        Optional<Course> optionalCourse = courseRepository.findById(courseId);

        if(
                optionalCourse.isPresent()
                        && (
                        optionalCourse.get().getUsers().contains(user)
                                || user.hasRole("ROLE_EMPLOYEE")
                                || user.hasRole("ROLE_ADMIN")
                )
        ){
            return courseMaterialRepository.findByCourseId(courseId);
        }



        return new ArrayList<>();
    }

    public Optional<CourseMaterial> getMaterialById(Long id, HttpServletRequest request) {
        Long userId = userService.getUserIdByAuthTokenRequest(request);
        User user = userRepository.findById(userId).orElseThrow();

        Optional<CourseMaterial> courseMaterialOptional =  courseMaterialRepository.findById(id);
        if(courseMaterialOptional.isPresent()){

            Optional<Course> optionalCourse = courseRepository.findById(courseMaterialOptional.get().getCourse().getId());

            if(
                    optionalCourse.isPresent()
                            && (
                            optionalCourse.get().getUsers().contains(user)
                                    || user.hasRole("ROLE_EMPLOYEE")
                                    || user.hasRole("ROLE_ADMIN")
                    )
            ){
                return courseMaterialOptional;
            }
        }






        return Optional.empty();


    }

    public CourseMaterial updateMaterial(Long id, CourseMaterial materialDetails) {
        CourseMaterial material = courseMaterialRepository.findById(id).orElseThrow();
        material.setTitle(materialDetails.getTitle());
        material.setType(materialDetails.getType());
        material.setContent(materialDetails.getContent());
        material.setUrl(materialDetails.getUrl());
        return courseMaterialRepository.save(material);
    }


    public void deleteMaterial(Long id) {
        courseMaterialRepository.deleteById(id);
    }

    public List<String> uploadMaterialVideo(List<MultipartFile> files) {
        Format formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String date = formatter.format(new java.util.Date());
        String videoFolderName = date+"_"+UUID.randomUUID().toString();
        String videoFileDir = rootUploadPath+VIDEOS_COURSE_ACCES_DIRECTORY+videoFolderName+"/";
        String videoFileDirURL = VIDEOS_COURSE_ACCES_DIRECTORY+videoFolderName+"/";


        createUploadDirectoryIfNotExists(videoFileDir);
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            Path filePath = Paths.get(videoFileDir, filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                if(filename.contains(".m3u8")){
                    urls.add(videoFileDirURL + filename);
                    CourseMaterial courseMaterial = new CourseMaterial();
                    courseMaterial.setType("VIDEO");
                    courseMaterial.setUrl(List.of(videoFileDir + filename));
                    courseMaterialRepository.save(courseMaterial);
                }
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }
        return urls;
    }

    public List<String> uploadMaterialImages(List<MultipartFile> files, List<String> urlList) {
        String date = (new SimpleDateFormat("yyyyMMddHHmmss"))
                .format(new java.util.Date());
        String fileDir = rootUploadPath+IMAGES_COURSE_ACCES_DIRECTORY;
        String fileDirURL = IMAGES_COURSE_ACCES_DIRECTORY;

        Optional<CourseMaterial> courseMaterialOptional;
        if(urlList!=null)courseMaterialOptional = courseMaterialRepository.findByUrl(urlList.get(0));
        else courseMaterialOptional = Optional.empty();

        CourseMaterial courseMaterial;
        List<String> urls;
        if(courseMaterialOptional.isPresent()){
            courseMaterial = courseMaterialOptional.get();
            urls = courseMaterial.getUrl();
        }else{
            courseMaterial = new CourseMaterial();
            urls = new ArrayList<>();
        }


        courseMaterial.setType("IMAGE");

        List<String> thisTimeUploadedUrls = new ArrayList<>();


        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = ""; // Domyślna wartość jeśli nie ma rozszerzenia
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // Pobierz rozszerzenie
            }

            String filename = date+"_"+UUID.randomUUID().toString()+extension;
            Path filePath = Paths.get(fileDir, filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                String fileUrl = fileDirURL + filename; // Ścieżka do pliku
                urls.add(fileUrl); // Dodanie URL do listy zwracanej
                thisTimeUploadedUrls.add(fileUrl);

            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }

        // Przypisz listę URL-i do obiektu CourseMaterial
        courseMaterial.setUrl(urls);

        // Zapisz CourseMaterial w bazie danych
        courseMaterialRepository.save(courseMaterial);

        return thisTimeUploadedUrls;
    }


    public List<String> uploadMaterialFiles(List<MultipartFile> files, List<String> urlList) {
        Format formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String date = formatter.format(new java.util.Date());

        String fileDir = rootUploadPath+FILES_COURSE_ACCES_DIRECTORY;
        String fileDirURL = FILES_COURSE_ACCES_DIRECTORY;

        Optional<CourseMaterial> courseMaterialOptional;
        if(urlList!=null)courseMaterialOptional = courseMaterialRepository.findByUrl(urlList.get(0));
        else courseMaterialOptional = Optional.empty();

        CourseMaterial courseMaterial;
        List<String> urls;
        if(courseMaterialOptional.isPresent()){
            courseMaterial = courseMaterialOptional.get();
            urls = courseMaterial.getUrl();
        }else{
            courseMaterial = new CourseMaterial();
            urls = new ArrayList<>();
        }

        courseMaterial.setType("FILE");


        List<String> thisTimeUploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = ""; // Domyślna wartość jeśli nie ma rozszerzenia
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // Pobierz rozszerzenie
            }

            String filename = date+"_"+UUID.randomUUID().toString()+extension;
            Path filePath = Paths.get(fileDir, filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                String fileUrl = fileDirURL + filename; // Ścieżka do pliku
                urls.add(fileUrl); // Dodanie URL do listy zwracanej
                thisTimeUploadedUrls.add(fileUrl);

            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }

        // Przypisz listę URL-i do obiektu CourseMaterial
        courseMaterial.setUrl(urls);

        // Zapisz CourseMaterial w bazie danych
        courseMaterialRepository.save(courseMaterial);

        return thisTimeUploadedUrls;
    }
}
