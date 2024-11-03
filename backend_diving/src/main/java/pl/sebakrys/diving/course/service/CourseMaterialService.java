package pl.sebakrys.diving.course.service;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.GoogleCloudStorage.service.GcsService;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.repo.CourseMaterialRepo;
import pl.sebakrys.diving.course.repo.CourseRepo;
import pl.sebakrys.diving.security.UserSecurityService;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.io.IOException;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Service
public class CourseMaterialService {

    @Value("${spring.cloud.gcp.storage.bucket}")
    private String gcsBucketName; // Dodane

    public static final String IMAGES_COURSE_ACCESS_DIRECTORY = "course_materials/images/";
    public static final String VIDEOS_COURSE_ACCESS_DIRECTORY = "course_materials/videos/";
    public static final String FILES_COURSE_ACCESS_DIRECTORY = "course_materials/files/";

    @Autowired
    private CourseMaterialRepo courseMaterialRepository;

    @Autowired
    private CourseRepo courseRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private UserSecurityService userSecurityService;

    @Autowired
    private GcsService gcsService; // Dodane

    @PostConstruct
    public void init() {
        // Usunięto inicjalizację lokalnych katalogów
    }

    /**
     * Dodaje nowy materiał do kursu.
     *
     * @param courseId ID kursu.
     * @param material Dane materiału.
     * @return Zapisany obiekt CourseMaterial.
     */
    @Transactional
    public CourseMaterial addMaterial(Long courseId, CourseMaterial material) {
        // Znajdź kurs na podstawie ID
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        // Inicjalizacja listy url, jeśli jest null
        if (material.getUrl() == null) {
            material.setUrl(new ArrayList<>()); // Inicjalizujemy pustą listę
        }

        System.out.println("material.getUrl(): " + material.getUrl().toString());

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

                System.out.println("courseMaterial.getUrl: " + courseMaterial.getUrl().toString());

                // Nadpisanie istniejącej listy URL-i nową listą
                courseMaterial.setUrl(material.getUrl());
                System.out.println("courseMaterial.getUrl{2}: " + courseMaterial.getUrl().toString());

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

    /**
     * Przesyła pliki wideo do GCS i generuje podpisane URL-e.
     *
     * @param files Lista MultipartFile z plikami wideo.
     * @return Lista podpisanych URL-i przesłanych plików wideo.
     */
    public List<String> uploadMaterialVideo(List<MultipartFile> files) {//fixme  wysyłany jest tylko jeden plik (m3u8) zamiast wszytskihc
        Format formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String date = formatter.format(new java.util.Date());
        String videoFolderName = date + "_" + UUID.randomUUID().toString();
        List<String> signedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            String filePath = VIDEOS_COURSE_ACCESS_DIRECTORY + videoFolderName + "/" + filename;

            try {
                // Przesyłanie pliku wideo do GCS
                String url = gcsService.uploadFile(file);
                String gcsFilename = extractFilenameFromUrl(url);

                // Generowanie podpisanego URL do pobrania
                URL signedUrl = gcsService.generateSignedUrlForDownload(gcsFilename, 60, TimeUnit.MINUTES); // 60 minut
                signedUrls.add(signedUrl.toString());

                // Tworzenie obiektu CourseMaterial
                CourseMaterial courseMaterial = new CourseMaterial();
                courseMaterial.setType("VIDEO");
                System.err.println("VIDEO:"+url);
                courseMaterial.setUrl(List.of(url));
                courseMaterialRepository.save(courseMaterial);
                return courseMaterial.getUrl();
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }
        return signedUrls;
    }

    /**
     * Przesyła pliki obrazów do GCS i generuje podpisane URL-e.
     *
     * @param files   Lista MultipartFile z plikami obrazów.
     * @param urlList Lista standardowych URL-i do istniejących materiałów.
     * @return Lista podpisanych URL-i przesłanych plików obrazów.
     */
    public List<String> uploadMaterialImages(List<MultipartFile> files, List<String> urlList) {
        String date = (new SimpleDateFormat("yyyyMMddHHmmss"))
                .format(new java.util.Date());
        String fileDirURL = IMAGES_COURSE_ACCESS_DIRECTORY;

        Optional<CourseMaterial> courseMaterialOptional;
        if (urlList != null && !urlList.isEmpty()) {
            courseMaterialOptional = courseMaterialRepository.findByUrl(urlList.get(0));
        } else {
            courseMaterialOptional = Optional.empty();
        }

        CourseMaterial courseMaterial;
        List<String> urls;
        if (courseMaterialOptional.isPresent()) {
            courseMaterial = courseMaterialOptional.get();
            urls = courseMaterial.getUrl();
        } else {
            courseMaterial = new CourseMaterial();
            urls = new ArrayList<>();
        }

        courseMaterial.setType("IMAGE");

        List<String> thisTimeSignedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = ""; // Domyślna wartość jeśli nie ma rozszerzenia
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // Pobierz rozszerzenie
            }

            String filename = date + "_" + UUID.randomUUID().toString() + extension;
            String fileUrl = fileDirURL + filename; // URL do pliku

            try {
                // Przesyłanie pliku obrazu do GCS
                String url = gcsService.uploadFile(file);
                urls.add(url); // Dodanie standardowego URL do listy
                System.err.println(url);
                thisTimeSignedUrls.add(gcsService.generateSignedUrlForDownload(filename, 60, TimeUnit.MINUTES).toString()); // Dodanie podpisanego URL
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }

        // Przypisz listę standardowych URL-i do obiektu CourseMaterial
        courseMaterial.setUrl(urls);

        // Zapisz CourseMaterial w bazie danych
        courseMaterialRepository.save(courseMaterial);

        return courseMaterial.getUrl();
        //return thisTimeSignedUrls;
    }

    /**
     * Przesyła pliki do GCS i generuje podpisane URL-e.
     *
     * @param files   Lista MultipartFile z plikami.
     * @param urlList Lista standardowych URL-i do istniejących materiałów.
     * @return Lista podpisanych URL-i przesłanych plików.
     */
    public List<String> uploadMaterialFiles(List<MultipartFile> files, List<String> urlList) {
        Format formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String date = formatter.format(new java.util.Date());

        String fileDirURL = FILES_COURSE_ACCESS_DIRECTORY;

        Optional<CourseMaterial> courseMaterialOptional;
        if (urlList != null && !urlList.isEmpty()) {
            courseMaterialOptional = courseMaterialRepository.findByUrl(urlList.get(0));
        } else {
            courseMaterialOptional = Optional.empty();
        }

        CourseMaterial courseMaterial;
        List<String> urls;
        if (courseMaterialOptional.isPresent()) {
            courseMaterial = courseMaterialOptional.get();
            urls = courseMaterial.getUrl();
        } else {
            courseMaterial = new CourseMaterial();
            urls = new ArrayList<>();
        }

        courseMaterial.setType("FILE");

        List<String> thisTimeSignedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = ""; // Domyślna wartość jeśli nie ma rozszerzenia
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // Pobierz rozszerzenie
            }

            String filename = date + "_" + UUID.randomUUID().toString() + extension;
            String fileUrl = fileDirURL + filename; // URL do pliku

            try {
                // Przesyłanie pliku do GCS
                String url = gcsService.uploadFile(file);
                urls.add(url); // Dodanie standardowego URL do listy
                System.err.println(url);
                thisTimeSignedUrls.add(gcsService.generateSignedUrlForDownload(filename, 60, TimeUnit.MINUTES).toString()); // Dodanie podpisanego URL
            } catch (IOException e) {
                throw new RuntimeException("Błąd podczas przesyłania pliku", e);
            }
        }

        // Przypisz listę standardowych URL-i do obiektu CourseMaterial
        courseMaterial.setUrl(urls);

        // Zapisz CourseMaterial w bazie danych
        courseMaterialRepository.save(courseMaterial);

        return courseMaterial.getUrl();
        //return thisTimeSignedUrls;
    }

    /**
     * Ekstrahuje nazwę pliku z URL.
     *
     * @param url URL pliku w GCS.
     * @return Nazwa pliku.
     */
    private String extractFilenameFromUrl(String url) {
        return url.substring(url.lastIndexOf("/") + 1);
    }

    /**
     * Pobiera materiały kursu.
     *
     * @param courseId ID kursu.
     * @param request  Obiekt HttpServletRequest.
     * @return Lista obiektów CourseMaterial z podpisanymi URL-ami.
     */
    public List<CourseMaterial> getMaterialsForCourse(Long courseId, HttpServletRequest request) {
        Long userId = userSecurityService.getUserIdByAuthTokenRequest(request);
        User user = userRepository.findById(userId).orElseThrow();

        Optional<Course> optionalCourse = courseRepository.findById(courseId);

        if (
                optionalCourse.isPresent()
                        && (
                        optionalCourse.get().getUsers().contains(user)
                                || user.hasRole("ROLE_EMPLOYEE")
                                || user.hasRole("ROLE_ADMIN")
                )
        ) {
            List<CourseMaterial> materials = courseMaterialRepository.findByCourseId(courseId);

            // Generowanie podpisanych URL-i dla każdego materiału
            materials.forEach(material -> {
                List<String> signedUrls = new ArrayList<>();
                for (String url : material.getUrl()) {
                    String filename = extractFilenameFromUrl(url);
                    System.err.println(url);
                    URL signedUrl = gcsService.generateSignedUrlForDownload(filename, 60, TimeUnit.MINUTES); // 60 minut
                    System.err.println(signedUrl.toString());
                    signedUrls.add(signedUrl.toString());
                }
                material.setUrl(signedUrls);
            });

            return materials;
        }

        return new ArrayList<>();
    }

    /**
     * Pobiera materiał kursu na podstawie ID.
     *
     * @param id      ID materiału.
     * @param request Obiekt HttpServletRequest.
     * @return Opcjonalny obiekt CourseMaterial z podpisanymi URL-ami.
     */
    public Optional<CourseMaterial> getMaterialById(Long id, HttpServletRequest request) {
        Long userId = userSecurityService.getUserIdByAuthTokenRequest(request);
        User user = userRepository.findById(userId).orElseThrow();

        Optional<CourseMaterial> courseMaterialOptional = courseMaterialRepository.findById(id);
        if (courseMaterialOptional.isPresent()) {

            Optional<Course> optionalCourse = courseRepository.findById(courseMaterialOptional.get().getCourse().getId());

            if (
                    optionalCourse.isPresent()
                            && (
                            optionalCourse.get().getUsers().contains(user)
                                    || user.hasRole("ROLE_EMPLOYEE")
                                    || user.hasRole("ROLE_ADMIN")
                    )
            ) {
                CourseMaterial material = courseMaterialOptional.get();

                List<String> signedUrls = new ArrayList<>();
                for (String url : material.getUrl()) {
                    String filename = extractFilenameFromUrl(url);
                    System.err.println(url);
                    URL signedUrl = gcsService.generateSignedUrlForDownload(filename, 60, TimeUnit.MINUTES); // 60 minut
                    System.err.println(signedUrl.toString());
                    signedUrls.add(signedUrl.toString());
                }
                material.setUrl(signedUrls);

                return Optional.of(material);
            }
        }

        return Optional.empty();
    }

    /**
     * Aktualizuje istniejący materiał kursu.
     *
     * @param id             ID materiału.
     * @param materialDetails Nowe dane materiału.
     * @return Zaktualizowany obiekt CourseMaterial.
     */
    public CourseMaterial updateMaterial(Long id, CourseMaterial materialDetails) {
        CourseMaterial material = courseMaterialRepository.findById(id).orElseThrow();
        material.setTitle(materialDetails.getTitle());
        material.setType(materialDetails.getType());
        material.setContent(materialDetails.getContent());
        material.setUrl(materialDetails.getUrl());
        return courseMaterialRepository.save(material);
    }

    /**
     * Usuwa materiał kursu na podstawie ID.
     *
     * @param id ID materiału.
     */
    public void deleteMaterial(Long id) {
        // Usunięcie plików z GCS
        Optional<CourseMaterial> materialOptional = courseMaterialRepository.findById(id);
        if (materialOptional.isPresent()) {
            CourseMaterial material = materialOptional.get();
            for (String url : material.getUrl()) {
                String filename = extractFilenameFromUrl(url);
                gcsService.deleteFile(filename);
            }
        }
        courseMaterialRepository.deleteById(id);
    }
}
