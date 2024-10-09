package pl.sebakrys.diving.events.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.events.entity.Event;
import pl.sebakrys.diving.events.entity.EventRegistration;
import pl.sebakrys.diving.events.repo.EventRegistrationRepo;
import pl.sebakrys.diving.events.repo.EventRepo;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.List;

@Service
public class EventRegistrationService {

    @Autowired
    private EventRepo eventRepo;
    @Autowired
    private EventRegistrationRepo eventRegistrationRepo;
    @Autowired
    private UserRepo userRepo;

    //__________________________________________________________________________________

    public EventRegistration addEventRegistration(Long userId, Long eventId, String message){
        Event event = eventRepo.getReferenceById(eventId);
        User user = userRepo.getReferenceById(userId);
        if(event==null || user ==null) return null;
        EventRegistration eventRegistration = new EventRegistration();
        eventRegistration.setEvent(event);
        eventRegistration.setMessage(message);
        eventRegistration.setAccepted(false);
        eventRegistration.setUser(user);
        return eventRegistrationRepo.save(eventRegistration);
    }

    public EventRegistration acceptEventRegistration(Long userId, Long eventId, boolean accepted){
        EventRegistration er = eventRegistrationRepo.getEventRegistrationsByUser_IdAndEvent_Id(userId, eventId);
        if(er==null) return null;
        er.setAccepted(accepted);

        return eventRegistrationRepo.save(er);
    }

    public List<EventRegistration> removeUserFromEvent(Long userId, Long eventId){
        EventRegistration er = eventRegistrationRepo.getEventRegistrationsByUser_IdAndEvent_Id(userId, eventId);
        if(er==null)return null;
        eventRegistrationRepo.delete(er);
        return eventRegistrationRepo.getEventRegistrationsByEvent_Id(eventId);
    }
}
