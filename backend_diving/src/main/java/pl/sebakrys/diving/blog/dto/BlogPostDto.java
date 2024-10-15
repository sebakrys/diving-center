package pl.sebakrys.diving.blog.dto;

import lombok.Data;

import java.util.List;

@Data
public class BlogPostDto {
    private String title;
    private String content;
    private List<String> images;

    // Gettery i settery
}

