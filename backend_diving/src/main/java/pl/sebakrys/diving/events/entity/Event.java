package pl.sebakrys.diving.events.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 250)
    private String name;
    @Column(length = 3500)
    private String description;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}

