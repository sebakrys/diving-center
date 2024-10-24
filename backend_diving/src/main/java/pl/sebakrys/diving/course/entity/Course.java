package pl.sebakrys.diving.course.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;

import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "courses")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private String description;


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "courses_users",
            joinColumns = @JoinColumn(name = "course_id"),  // Odnosi się do encji Course
            inverseJoinColumns = @JoinColumn(name = "user_id")  // Odnosi się do encji User
    )
    private Set<User> users = new HashSet<>();



}

