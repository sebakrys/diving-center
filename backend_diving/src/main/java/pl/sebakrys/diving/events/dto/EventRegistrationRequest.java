package pl.sebakrys.diving.events.dto;

import lombok.Data;

@Data
public class EventRegistrationRequest {
    private String userEmail;
    private Long eventId;
    private String message;
}
