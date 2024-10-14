package pl.sebakrys.diving.events.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.events.entity.Event;
import pl.sebakrys.diving.events.entity.EventRegistration;
import pl.sebakrys.diving.events.repo.EventRegistrationRepo;
import pl.sebakrys.diving.events.repo.EventRepo;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepo eventRepo;
    private final EventRegistrationRepo eventRegistrationRepo;
    private final UserRepo userRepo;

    @Autowired
    public EventService(EventRepo eventRepo, EventRegistrationRepo eventRegistrationRepo, UserRepo userRepo) {
        this.eventRepo = eventRepo;
        this.eventRegistrationRepo = eventRegistrationRepo;
        this.userRepo = userRepo;
    }

    // Dodanie nowego eventu
    public Event addEvent(Event event) {
        return eventRepo.save(event);
    }

    // Pobranie eventu na podstawie ID
    public Optional<Event> getEvent(Long eventId) {
        return eventRepo.findById(eventId);
    }

    // Pobranie wszystkich eventów
    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    // Pobranie eventów w zakresie trzech miesięcy wokół środkowego miesiąca
    public List<Event> getEventsFor3Months(int middleMonth, int year) {
        // Sprawdź, czy middleMonth to styczeń (1) lub grudzień (12) i dostosuj miesiące oraz lata
        int previousMonth = middleMonth == 1 ? 12 : middleMonth - 1;
        int previousMonthYear = middleMonth == 1 ? year - 1 : year;

        int nextMonth = middleMonth == 12 ? 1 : middleMonth + 1;
        int nextMonthYear = middleMonth == 12 ? year + 1 : year;

        // Oblicz pierwszy dzień poprzedniego miesiąca
        LocalDate startOfPreviousMonth = LocalDate.of(previousMonthYear, previousMonth, 1);
        LocalDateTime startDateTime = startOfPreviousMonth.atStartOfDay();

        // Oblicz ostatni dzień następnego miesiąca
        LocalDate endOfNextMonth = LocalDate.of(nextMonthYear, nextMonth, 1).withDayOfMonth(LocalDate.of(nextMonthYear, nextMonth, 1).lengthOfMonth());
        LocalDateTime endDateTime = endOfNextMonth.atTime(23, 59, 59);

        // Znajdź wydarzenia w podanym zakresie
        return eventRepo.findAllByDateRange(startDateTime, endDateTime);
    }


    // Edytowanie eventu
    public Optional<Event> editEvent(Event event, Long eventId) {
        return eventRepo.findById(eventId)
                .map(existingEvent -> {
                    existingEvent.setName(event.getName());
                    existingEvent.setDescription(event.getDescription());
                    existingEvent.setStartDate(event.getStartDate());
                    existingEvent.setEndDate(event.getEndDate());
                    return eventRepo.save(existingEvent);
                });
    }

    // Usunięcie eventu i powiązanych rejestracji
    public Optional<Event> deleteEvent(Long eventId) {
        return eventRepo.findById(eventId)
                .map(event -> {
                    List<EventRegistration> eventRegistrations = eventRegistrationRepo.getEventRegistrationsByEvent_Id(eventId);
                    eventRegistrationRepo.deleteAll(eventRegistrations); // Użycie batch delete do usunięcia wszystkich rejestracji związanych z eventem
                    eventRepo.delete(event);
                    return event;
                });
    }
}
