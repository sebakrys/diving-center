package pl.sebakrys.diving.blog.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BlogPostDto {
    private String title;
    private UUID userUUID;
    private String content;
    private List<String> images;

    // Gettery i settery
}

