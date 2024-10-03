package pl.sebakrys.diving.rental.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "items_rental")
@Data
public class RentalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Rental rental;

    @ManyToOne
    private RentalProduct product;
}

