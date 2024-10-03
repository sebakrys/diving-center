package pl.sebakrys.diving.events.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.events.entity.EventRegistration;

@Repository
public interface EventRegistrationRepo extends JpaRepository<EventRegistration, Long> {

}
