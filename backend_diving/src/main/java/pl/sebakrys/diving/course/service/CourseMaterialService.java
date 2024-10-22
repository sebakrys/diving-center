package pl.sebakrys.diving.course.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.repo.CourseMaterialRepo;
import pl.sebakrys.diving.course.repo.CourseRepo;


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
        Course course = courseRepository.findById(courseId).orElseThrow();
        if(!material.getUrl().isEmpty() && !material.getType().equals("TEXT")){
            Optional<CourseMaterial> courseMaterialOptional = courseMaterialRepository.findByUrl(material.getUrl().get(0));
            if(courseMaterialOptional.isPresent()){
                CourseMaterial courseMaterial = courseMaterialOptional.get();
                courseMaterial.setType(material.getType());
                courseMaterial.setTitle(material.getTitle());
                courseMaterial.setContent(material.getContent());
                courseMaterial.setCourse(course);
                return courseMaterialRepository.save(courseMaterial);
            }
        } else {
            if(material.getType().equals("TEXT")) material.setUrl(null);
            material.setCourse(course);
            return courseMaterialRepository.save(material);
        }

        return null;
    }


    public List<CourseMaterial> getMaterialsForCourse(Long courseId) {
        return courseMaterialRepository.findByCourseId(courseId);
    }

    public Optional<CourseMaterial> getMaterialById(Long id) {
        return courseMaterialRepository.findById(id);
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


        createUploadDirectoryIfNotExists(videoFileDir);
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            Path filePath = Paths.get(videoFileDir, filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                if(filename.contains(".m3u8")){
                    urls.add(videoFileDir + filename);
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
    public List<String> uploadMaterialFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        String fileDir = rootUploadPath+FILES_COURSE_ACCES_DIRECTORY;

        CourseMaterial courseMaterial = new CourseMaterial();
        courseMaterial.setType("FILE");


        for (MultipartFile file : files) {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(fileDir, filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                String fileUrl = fileDir + filename; // Ścieżka do pliku
                urls.add(fileUrl); // Dodanie URL do listy zwracanej

            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }

        // Przypisz listę URL-i do obiektu CourseMaterial
        courseMaterial.setUrl(urls);

        // Zapisz CourseMaterial w bazie danych
        courseMaterialRepository.save(courseMaterial);

        return urls;
    }
}
