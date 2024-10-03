package pl.sebakrys.diving.events.entity;

import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.users.entity.User;

@Entity
@Table(name = "event_registrations")
@Data
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Event event;

    @ManyToOne
    private User user;
}

