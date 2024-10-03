package pl.sebakrys.diving.rental.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.rental.entity.Rental;
import pl.sebakrys.diving.rental.entity.RentalItem;

@Repository
public interface RentalItemRepo extends JpaRepository<RentalItem, Long> {

}
