package pl.sebakrys.diving.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import pl.sebakrys.diving.users.entity.Role;

import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserDto {
    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;
    private boolean nonBlocked;
    private Set<Role> roles;


}
