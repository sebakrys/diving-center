package pl.sebakrys.diving.course.entity;

import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.users.entity.User;

//Zapisanie na szkolenie
@Entity
@Table(name = "course_enrollments")
@Data
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Course course;

    @ManyToOne
    private User user;
}
