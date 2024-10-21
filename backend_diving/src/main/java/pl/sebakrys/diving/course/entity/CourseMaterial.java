package pl.sebakrys.diving.course.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "course_materials")
@Data
public class CourseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String title;
    private String type; // np. "VIDEO", "PDF", "TEXT", "IMAGE"
    @Column(length = 3500)
    private String content; // np. dla textu, albo link, a dla plików dodatkowe informacje
    private String url; // ścieżka do pliku

    @ManyToOne
    private Course course;
}

