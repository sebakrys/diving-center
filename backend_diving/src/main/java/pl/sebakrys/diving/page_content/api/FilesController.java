package pl.sebakrys.diving.page_content.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.page_content.service.FilesService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin // for React and API
@RestController
@RequestMapping("/files") // Wspólna ścieżka dla endpointów
public class FilesController {

    @Autowired
    FilesService filesService;

    @PostMapping("/upload-page")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> uploadPage(@RequestParam("page") MultipartFile page, @RequestParam("filename") String filename) {
        String url = filesService.uploadPage(page, filename);
        Map<String, String> response = Map.of("url", url);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile image, @RequestParam("filename") String filename) {
        String url = filesService.uploadImage(image, filename);
        Map<String, String> response = Map.of("url", url);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/all-pages")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, List<String>>> getAllFilesPages() {
        List<String> pageFiles = filesService.getPageFiles();

        Map<String, List<String>> response = Map.of(
                "pages", pageFiles
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all-images")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, List<String>>> getAllFilesImages() {
        List<String> imageFiles = filesService.getImageFiles();

        Map<String, List<String>> response = Map.of(
                "images", imageFiles
        );

        return ResponseEntity.ok(response);
    }
}
