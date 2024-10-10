package pl.sebakrys.diving.events.dto;

import lombok.Data;

@Data
public class EventRegistrationRequest {
    private Long userId;
    private Long eventId;
    private String message;
}
