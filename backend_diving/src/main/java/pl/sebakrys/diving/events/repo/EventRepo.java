package pl.sebakrys.diving.events.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.events.entity.Event;

@Repository
public interface EventRepo extends JpaRepository<Event, Long> {

}
