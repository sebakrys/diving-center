package pl.sebakrys.diving.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserNamesAndIDDto {
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String email;
}
