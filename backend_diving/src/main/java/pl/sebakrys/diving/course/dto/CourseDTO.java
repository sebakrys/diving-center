package pl.sebakrys.diving.course.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import pl.sebakrys.diving.course.entity.Course;

@Data
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String name;
    private String description;


    public CourseDTO(Course course) {
        this.id = course.getId();
        this.name = course.getName();
        this.description = course.getDescription();
    }


}
