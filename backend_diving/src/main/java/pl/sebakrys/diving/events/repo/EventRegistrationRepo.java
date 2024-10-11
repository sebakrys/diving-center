package pl.sebakrys.diving.events.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.events.entity.EventRegistration;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepo extends JpaRepository<EventRegistration, Long> {

    List<EventRegistration> getEventRegistrationsByEvent_Id(Long Event_Id);
    Optional<EventRegistration> getEventRegistrationsByUser_IdAndEvent_Id(Long User_Id, Long Event_Id);
    Optional<EventRegistration> getEventRegistrationsByUser_EmailAndEvent_Id(String User_Email, Long Event_Id);


}
