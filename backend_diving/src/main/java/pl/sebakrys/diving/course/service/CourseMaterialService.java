package pl.sebakrys.diving.course.service;

import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseMaterialService {

    @Autowired
    private CourseMaterialRepo courseMaterialRepository;

    @Autowired
    private CourseRepo courseRepository;

    private final String UPLOAD_PATH = "upload/materials/";//TODO zmienic to albo zadelkarowac gdzies indziej

    public CourseMaterial addMaterial(Long courseId, CourseMaterial material) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        material.setCourse(course);
        return courseMaterialRepository.save(material);
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

    public List<String> uploadMaterialFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_PATH, filename);

            try {
                Files.copy(file.getInputStream(), filePath);
                urls.add("/materials/" + filename);  // Możesz zmienić tę ścieżkę według swoich potrzeb
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }
        return urls;
    }
}
