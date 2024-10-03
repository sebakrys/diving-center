package pl.sebakrys.diving.rental.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "products_rental")
@Data
public class RentalProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private boolean available;
}
