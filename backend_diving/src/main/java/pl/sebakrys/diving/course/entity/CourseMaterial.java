package pl.sebakrys.diving.course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "course_materials")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String title;
    private String type; // np. "VIDEO", "PDF", "TEXT", "IMAGE"
    @Column(length = 3500)
    private String content; // np. dla textu, albo link, a dla plików dodatkowe informacje

    @ElementCollection
    @CollectionTable(name = "course_material_urls", joinColumns = @JoinColumn(name = "material_id"))
    @Column(name = "url")
    private List<String> url; // Przechowywanie listy URL-i

    @ManyToOne
    private Course course;
}

