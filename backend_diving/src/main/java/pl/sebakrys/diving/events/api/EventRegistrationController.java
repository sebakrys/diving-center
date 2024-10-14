package pl.sebakrys.diving.events.api;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.events.dto.EventRegistrationRequest;
import pl.sebakrys.diving.events.entity.EventRegistration;
import pl.sebakrys.diving.events.service.EventRegistrationService;

import java.util.List;
import java.util.Optional;

@CrossOrigin // for React and API
@RestController
@RequestMapping("/event-registration")
public class EventRegistrationController {

    private final EventRegistrationService eventRegistrationService;

    @Autowired
    public EventRegistrationController(EventRegistrationService eventRegistrationService) {
        this.eventRegistrationService = eventRegistrationService;
    }

    @PostMapping("/")
    public ResponseEntity<EventRegistration> addEventRegistration(
            @RequestBody EventRegistrationRequest request) {
        return eventRegistrationService
                .addEventRegistration(request.getUserEmail(), request.getEventId(), request.getMessage())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }


    @PutMapping("/{userId}/{eventId}")
    public ResponseEntity<EventRegistration> acceptEventRegistration(
            @PathVariable Long userId,
            @PathVariable Long eventId,
            @RequestParam boolean accepted) {
        return eventRegistrationService.acceptEventRegistration(userId, eventId, accepted)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{registrationId}")
    public ResponseEntity<EventRegistration> acceptEventRegistration(
            @PathVariable Long registrationId,
            @RequestParam boolean accepted) {
        return eventRegistrationService.acceptEventRegistration(registrationId, accepted)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }



    @GetMapping("/")
    public ResponseEntity<List<EventRegistration>> getAllEventRegistrations() {
        return ResponseEntity.ok(eventRegistrationService.getAllEventRegistrations());
    }


    @GetMapping("/{registrationId}")
    public ResponseEntity<EventRegistration> getEventRegistrationById(@PathVariable Long registrationId) {
        return eventRegistrationService.getEventRegistrationById(registrationId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<EventRegistration>> getEventRegistrationsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventRegistrationService.getEventRegistrationsByEventId(eventId));
    }

    @DeleteMapping("/{userId}/{eventId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<EventRegistration>> removeEventRegistrationFromEvent(
            @PathVariable Long userId,
            @PathVariable Long eventId) {
        List<EventRegistration> remainingRegistrations = eventRegistrationService.removeEventRegistrationFromEvent(userId, eventId);
        if (remainingRegistrations != null && !remainingRegistrations.isEmpty()) {
            return ResponseEntity.ok(remainingRegistrations);
        } else {
            return ResponseEntity.noContent().build(); // Zwraca 204 No Content, jeśli lista jest pusta
        }
    }

    @DeleteMapping("/{eventRegistrationId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<EventRegistration> removeRegistration(@PathVariable Long eventRegistrationId) {
        Optional<EventRegistration> deletedRegistration = eventRegistrationService.removeEventRegistration(eventRegistrationId);
        return deletedRegistration
                .map(ResponseEntity::ok)
                .orElseGet(()->ResponseEntity.notFound().build());
    }

}
