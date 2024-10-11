package pl.sebakrys.diving.events.api;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.events.entity.Event;
import pl.sebakrys.diving.events.service.EventService;

import java.util.List;
import java.util.Optional;

@CrossOrigin // for React and API
@RestController
@RequestMapping("/event") // Wspólna ścieżka dla endpointów
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Event> addEvent(@RequestBody Event event) {
        Event savedEvent = eventService.addEvent(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PutMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Event> editEvent(@RequestBody Event event, @PathVariable Long eventId) {
        Optional<Event> updatedEvent = eventService.editEvent(event, eventId);
        return updatedEvent
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> getEvent(@PathVariable Long eventId) {
        Optional<Event> event = eventService.getEvent(eventId);
        return event
                .map(ResponseEntity::ok)
                .orElseGet(()->ResponseEntity.notFound().build());

    }

    @GetMapping("/{month}/{year}")
    @PermitAll
    public ResponseEntity<List<Event>> get3MonthsEvents(@PathVariable int month, @PathVariable int year) {
        List<Event> events = eventService.getEventsFor3Months(month, year);
        return ResponseEntity.ok(events);
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EMPLOYEE')")
    public ResponseEntity<Event> deleteEvent(@PathVariable Long eventId) {
        Optional<Event> deletedEvent = eventService.deleteEvent(eventId);
        return deletedEvent
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
