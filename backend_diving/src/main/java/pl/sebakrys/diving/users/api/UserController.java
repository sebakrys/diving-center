package pl.sebakrys.diving.users.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.users.dto.UserDto;
import pl.sebakrys.diving.users.dto.UserNamesDto;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin // For React and API
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        try {
            User newUser = userService.addUser(user);
            return ResponseEntity.ok(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Możesz dodać komunikat błędu w ciele odpowiedzi
        }
    }

    // Endpoint do dodawania roli do użytkownika
    @PutMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> addRoleToUser(
            @PathVariable Long userId,
            @PathVariable String roleName) {
        return userService.addRoleToUser(userId, roleName)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint do usuwania roli od użytkownika
    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable String roleName) {
        return userService.removeRoleFromUser(userId, roleName)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        if (!users.isEmpty()) {
            return ResponseEntity.ok(users);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsersWithRoles() {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.isActive(),
                        user.isNonBlocked(),
                        user.getRoles()
                ))
                .collect(Collectors.toList());
        if (!userDtos.isEmpty()) {
            return ResponseEntity.ok(userDtos);
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsersByRoleAndQuery(query, PageRequest.of(0, 10));//TODO dostosowywać z requestem
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}/activ/{activ}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> setActivateUser(
            @PathVariable Long userId,
            @PathVariable boolean activ) {
        return userService.setActiveUser(userId, activ)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/nonblock/{nonblock}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> setNonBlockUser(
            @PathVariable Long userId,
            @PathVariable boolean nonblock) {
        return userService.setNonBlockedUser(userId, nonblock)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserById(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/names/{email}")
    public ResponseEntity<UserNamesDto> getUserNamesByEmail(@PathVariable String email) {
        UserNamesDto userNamesDto = userService.getUserNamesByEmail(email);
        if(userNamesDto==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userNamesDto);
    }

    @GetMapping("/names/")
    public ResponseEntity<UserNamesDto> getUserNamesByAuthToken(HttpServletRequest request) {
        UserNamesDto userNamesDto = userService.getUserNamesByAuthTokenRequest(request);
        if(userNamesDto==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userNamesDto);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody User userDetails) {
        return userService.updateUser(userId, userDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
