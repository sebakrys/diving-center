package pl.sebakrys.diving.events.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class EventRegistrationRequest {
    private UUID userUUID;
    private Long eventId;
    private String message;
}
