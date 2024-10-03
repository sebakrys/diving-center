package pl.sebakrys.diving.rental.entity;

import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.users.entity.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rentals")
@Data
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String status;

    @ManyToOne
    private User user;

    @OneToMany(mappedBy = "rental", cascade = CascadeType.ALL)
    private Set<RentalItem> items = new HashSet<>();
}

