package pl.sebakrys.diving.blog.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.sebakrys.diving.blog.dto.BlogPostDto;
import pl.sebakrys.diving.blog.entity.BlogPost;
import pl.sebakrys.diving.blog.service.BlogService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin // for React and API
@RestController
@RequestMapping("/blog") // Wspólna ścieżka dla endpointów
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("image") List<MultipartFile> images) {
        List<String> urls = blogService.saveImages(images);
        Map<String, Object> response = new HashMap<>();
        response.put("urls", urls); // Zwracamy URL-e do przesłanych zdjęć
        return ResponseEntity.ok(response);
    }

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<BlogPost> createPost(@RequestBody BlogPostDto postDto) {
        BlogPost createdPost = blogService.createPost(postDto);
        return ResponseEntity.ok(createdPost);
    }
}
