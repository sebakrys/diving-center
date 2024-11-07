package pl.sebakrys.diving.page_content.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.course.entity.CourseMaterial;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FilesService {
    @Value("${root.upload.path}")
    private String rootUploadPath;

    public static final String IMAGES_ACCES_DIRECTORY = "/images/";
    public static final String PAGES_ACCES_DIRECTORY = "/pages/";


    @PostConstruct
    public void init() {
        createUploadDirectoryIfNotExists(rootUploadPath+IMAGES_ACCES_DIRECTORY);  // Tworzenie katalogu po ustawieniu ścieżki
        createUploadDirectoryIfNotExists(rootUploadPath+PAGES_ACCES_DIRECTORY);  // Tworzenie katalogu po ustawieniu ścieżki
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


    public List<String> getImageFiles() {
        try (Stream<Path> imageFiles = Files.walk(Paths.get(rootUploadPath + IMAGES_ACCES_DIRECTORY))) {
            return imageFiles
                    .filter(Files::isRegularFile) // Tylko pliki
                    .map(path -> IMAGES_ACCES_DIRECTORY + path.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas pobierania plików z katalogu obrazów", e);
        }
    }

    public List<String> getPageFiles() {
        try (Stream<Path> pageFiles = Files.walk(Paths.get(rootUploadPath + PAGES_ACCES_DIRECTORY))) {
            return pageFiles
                    .filter(Files::isRegularFile) // Tylko pliki
                    .map(path -> PAGES_ACCES_DIRECTORY + path.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas pobierania plików z katalogu stron", e);
        }
    }


    public String uploadImage(MultipartFile file, String newFilename) {
        // Pełna ścieżka pliku w systemie
        String pageFilePath = rootUploadPath + IMAGES_ACCES_DIRECTORY + newFilename;
        String pageFilePathURL = IMAGES_ACCES_DIRECTORY + newFilename; // Ścieżka URL

        // Wyodrębnienie katalogu nadrzędnego
        Path parentDir = Paths.get(pageFilePath).getParent();

        // Utworzenie katalogów, jeśli nie istnieją
        if (parentDir != null) {
            createUploadDirectoryIfNotExists(parentDir.toString());
        }

        Path filePath = Paths.get(pageFilePath);  // Pełna ścieżka do pliku

        try {
            if (Files.exists(filePath)) {
                // Zmień nazwę starego pliku z timestampem
                String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date());
                Path backupFilePath = Paths.get(filePath.getParent().toString(), filePath.getFileName() + "_" + timestamp);
                Files.move(filePath, backupFilePath);
            }

            // Zapisz nowy plik
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas przesyłania pliku", e);
        }

        return pageFilePathURL;
    }

    public String uploadPage(MultipartFile file, String newFilename) {
        // Pełna ścieżka pliku w systemie
        String pageFilePath = rootUploadPath + PAGES_ACCES_DIRECTORY + newFilename;
        String pageFilePathURL = PAGES_ACCES_DIRECTORY + newFilename; // Ścieżka URL

        // Wyodrębnienie katalogu nadrzędnego
        Path parentDir = Paths.get(pageFilePath).getParent();

        // Utworzenie katalogów, jeśli nie istnieją
        if (parentDir != null) {
            createUploadDirectoryIfNotExists(parentDir.toString());
        }

        Path filePath = Paths.get(pageFilePath);  // Pełna ścieżka do pliku

        try {
            if (Files.exists(filePath)) {
                // Zmień nazwę starego pliku z timestampem
                String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date());
                Path backupFilePath = Paths.get(filePath.getParent().toString(), filePath.getFileName() + "_" + timestamp);
                Files.move(filePath, backupFilePath);
            }

            // Zapisz nowy plik
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas przesyłania pliku", e);
        }

        return pageFilePathURL;
    }



}
