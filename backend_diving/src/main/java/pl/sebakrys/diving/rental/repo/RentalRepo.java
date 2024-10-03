package pl.sebakrys.diving.rental.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.rental.entity.Rental;

@Repository
public interface RentalRepo extends JpaRepository<Rental, Long> {

}
