package pl.sebakrys.diving.events.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.events.entity.Event;
import pl.sebakrys.diving.events.entity.EventRegistration;
import pl.sebakrys.diving.events.repo.EventRegistrationRepo;
import pl.sebakrys.diving.events.repo.EventRepo;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EventRegistrationService {

    private final EventRepo eventRepo;
    private final EventRegistrationRepo eventRegistrationRepo;
    private final UserRepo userRepo;

    @Autowired
    public EventRegistrationService(EventRepo eventRepo, EventRegistrationRepo eventRegistrationRepo, UserRepo userRepo) {
        this.eventRepo = eventRepo;
        this.eventRegistrationRepo = eventRegistrationRepo;
        this.userRepo = userRepo;
    }

    public Optional<EventRegistration> addEventRegistration(String email, Long eventId, String message) {
        Optional<Event> event = eventRepo.findById(eventId);
        Optional<User> user = userRepo.findByEmail(email);

        if (event.isEmpty() || user.isEmpty()) {
            return Optional.empty();
        }

        // Ensure uniqueness of user-event combination
        if (eventRegistrationRepo.getEventRegistrationsByUser_EmailAndEvent_Id(email, eventId).isPresent()) {
            return Optional.empty();
        }

        EventRegistration eventRegistration = new EventRegistration();
        eventRegistration.setEvent(event.get());
        eventRegistration.setUser(user.get());
        eventRegistration.setMessage(message);
        eventRegistration.setAccepted(false);

        return Optional.of(eventRegistrationRepo.save(eventRegistration));
    }

    public Optional<EventRegistration> editEventRegistration(String email, Long eventId, String message) {
        Optional<Event> event = eventRepo.findById(eventId);
        Optional<User> user = userRepo.findByEmail(email);

        if (event.isEmpty() || user.isEmpty()) {
            return Optional.empty();
        }

        Optional<EventRegistration> oldEventRegistrationOptional = eventRegistrationRepo.getEventRegistrationsByUser_EmailAndEvent_Id(email, eventId);

        // Check if exists
        if (oldEventRegistrationOptional.isEmpty()) {
            return Optional.empty();
        }

        EventRegistration eventRegistration = oldEventRegistrationOptional.get();
        eventRegistration.setMessage(message);

        return Optional.of(eventRegistrationRepo.save(eventRegistration));
    }

    public Optional<EventRegistration> acceptEventRegistration(UUID userUUId, Long eventId, boolean accepted) {
        return eventRegistrationRepo.getEventRegistrationsByUser_UuidAndEvent_Id(userUUId, eventId)
                .map(eventRegistration -> {
                    eventRegistration.setAccepted(accepted);
                    return eventRegistrationRepo.save(eventRegistration);
                });
    }

    public Optional<EventRegistration> acceptEventRegistration(Long eventRegistrationId, boolean accepted) {
        return eventRegistrationRepo.findById(eventRegistrationId)
                .map(eventRegistration -> {
                    eventRegistration.setAccepted(accepted);
                    return eventRegistrationRepo.save(eventRegistration);
                });
    }

    public List<EventRegistration> removeEventRegistrationFromEvent(UUID userUUId, Long eventId) {
        eventRegistrationRepo.getEventRegistrationsByUser_UuidAndEvent_Id(userUUId, eventId)
                .ifPresent(eventRegistrationRepo::delete);
        return eventRegistrationRepo.getEventRegistrationsByEvent_Id(eventId);
    }

    public Optional<EventRegistration> removeEventRegistration(Long eventRegistrationId) {
        Optional<EventRegistration> er = eventRegistrationRepo.findById(eventRegistrationId);
        er.ifPresent(eventRegistrationRepo::delete);
        return er;
    }

    public List<EventRegistration> getAllEventRegistrations() {
        return eventRegistrationRepo.findAll();
    }

    public List<EventRegistration> getEventRegistrationsByEventId(Long eventId) {
        return eventRegistrationRepo.getEventRegistrationsByEvent_Id(eventId);
    }

    public Optional<EventRegistration> getEventRegistrationById(Long registrationId) {
        return eventRegistrationRepo.findById(registrationId);
    }

    public Optional<EventRegistration> getEventRegistrationByUserEmailAndEventId(String userEmail, Long eventId) {
        return eventRegistrationRepo.getEventRegistrationsByUser_EmailAndEvent_Id(userEmail, eventId);
    }
}
