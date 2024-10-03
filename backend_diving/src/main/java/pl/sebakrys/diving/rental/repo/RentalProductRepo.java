package pl.sebakrys.diving.rental.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pl.sebakrys.diving.rental.entity.RentalProduct;

@Repository
public interface RentalProductRepo extends JpaRepository<RentalProduct, Long> {

}
