package pl.sebakrys.diving.users.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.security.UserSecurityService;
import pl.sebakrys.diving.users.dto.UserDto;
import pl.sebakrys.diving.users.dto.UserNamesDto;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000") // Konfiguracja CORS dla wszystkich metod w tym kontrolerze // For React and API
public class UserController {

    private final UserService userService;

    private final UserSecurityService userSecurityService;

    @Autowired
    public UserController(UserService userService, UserSecurityService userSecurityService) {
        this.userService = userService;
        this.userSecurityService = userSecurityService;
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
    @PutMapping("/{userUUId}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> addRoleToUser(
            @PathVariable UUID userUUId,
            @PathVariable String roleName) {
        return userService.addRoleToUser(userUUId, roleName)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint do usuwania roli od użytkownika
    @DeleteMapping("/{userUUId}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> removeRoleFromUser(
            @PathVariable UUID userUUId,
            @PathVariable String roleName) {
        return userService.removeRoleFromUser(userUUId, roleName)
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
                        user.getUuid(),
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

    @GetMapping("/search/{courseId}")
    public ResponseEntity<List<User>> searchUsersNotInCourse(@RequestParam String query, @PathVariable Long courseId) {
        List<User> users = userService.searchUsersNotInCourseByRoleAndQuery(query, courseId, PageRequest.of(0, 10));//TODO dostosowywać z requestem PAGEABLE
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userUUId}/activ/{activ}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> setActivateUser(
            @PathVariable UUID userUUId,
            @PathVariable boolean activ) {
        return userService.setActiveUser(userUUId, activ)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userUUId}/nonblock/{nonblock}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<User> setNonBlockUser(
            @PathVariable UUID userUUId,
            @PathVariable boolean nonblock) {
        return userService.setNonBlockedUser(userUUId, nonblock)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{userUUId}")
    public ResponseEntity<User> getUserByUUId(@PathVariable UUID userUUId) {
        return userService.getUserByUUId(userUUId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
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

    /*
    @GetMapping("/id/")
    public ResponseEntity<Long> getUserIdByAuthToken(HttpServletRequest request) {
        Long userId = userService.getUserIdByAuthTokenRequest(request);
        if(userId==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userId);
    }*/

    @GetMapping("/roles/")
    public ResponseEntity<List<String>> getUserRolesByAuthToken(HttpServletRequest request) {
        List<String> roleList = userSecurityService.getUserRolesByAuthTokenRequest(request);
        return ResponseEntity.ok(roleList);
    }

    @GetMapping("/uuid/")
    public ResponseEntity<UUID> getUserUUIdByAuthToken(HttpServletRequest request) {
        UUID userUUId = userSecurityService.getUserUUIdByAuthTokenRequest(request);
        if(userUUId==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userUUId);
    }

    @GetMapping("/names/")
    public ResponseEntity<UserNamesDto> getUserNamesByAuthToken(HttpServletRequest request) {
        UserNamesDto userNamesDto = userSecurityService.getUserNamesByAuthTokenRequest(request);
        if(userNamesDto==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userNamesDto);
    }

    @PutMapping("/{userUUId}")
    public ResponseEntity<User> updateUser(@PathVariable UUID userUUId, @RequestBody User userDetails) {
        return userService.updateUser(userUUId, userDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userUUId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userUUId) {
        userService.deleteUser(userUUId);
        return ResponseEntity.ok().build();
    }
}
