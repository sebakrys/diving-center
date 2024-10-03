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

    private String title;
    private String type; // np. "VIDEO", "PDF", "TEXT"
    private String url; // ścieżka do pliku

    @ManyToOne
    private Course course;
}

