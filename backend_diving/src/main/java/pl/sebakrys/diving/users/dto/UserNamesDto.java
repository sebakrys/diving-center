package pl.sebakrys.diving.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserNamesDto {
    private String firstName;
    private String lastName;
    private String email;
}
