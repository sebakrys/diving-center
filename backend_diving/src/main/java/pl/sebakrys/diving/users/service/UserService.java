package pl.sebakrys.diving.users.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.security.JwtUtil;
import pl.sebakrys.diving.security.UserSecurityService;
import pl.sebakrys.diving.users.dto.UserNamesDto;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.RoleRepo;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.*;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;



    @Autowired
    public UserService(UserRepo userRepo, RoleRepo roleRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
    }


    // Dodanie nowego użytkownika
    public User addUser(User user) {
        // Sprawdzenie, czy email jest już używany
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Szyfrowanie hasła
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Set<Role> roles = new HashSet<>();
        if (userRepo.count() == 0) {
            roles.addAll(roleRepo.findAll()); // Pierwszy użytkownik otrzymuje wszystkie role
        } else {
            Role clientRole = roleRepo.findByName("ROLE_CLIENT")
                    .orElseThrow(() -> new RuntimeException("ROLE_CLIENT not found"));
            roles.add(clientRole);
        }

        user.setRoles(roles);
        user.setActive(true);
        user.setNonBlocked(true);

        return userRepo.save(user);
    }


    // Pobranie użytkownika po ID
    public Optional<User> getUserById(Long userId) {
        return userRepo.findById(userId);
    }

    public Optional<User> getUserByUUId(UUID userUUId) {
        return userRepo.findByUuid(userUUId);
    }

    // Pobranie użytkownika po ID
    public Optional<User> getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public UserNamesDto getUserNamesByEmail(String email) {
        Optional<User> optionalUser = userRepo.findByEmail(email);
        if(optionalUser.isEmpty()) return null;
        User user = optionalUser.get();
        UserNamesDto userNamesDto = new UserNamesDto();
        userNamesDto.setEmail(user.getEmail());
        userNamesDto.setFirstName(user.getFirstName());
        userNamesDto.setLastName(user.getLastName());
        return userNamesDto;

    }


    // Pobranie wszystkich użytkowników
    public List<User> getAllUsers() {
        return userRepo.findAllByOrderByIdAsc();
    }

    public List<User> searchUsersNotInCourseByRoleAndQuery(String query, Long courseId, Pageable pageable) {
        return userRepo.findByRoleAndQueryExcludingCourse(
                "ROLE_CLIENT",
                "%" + query + "%",
                courseId,
                pageable
        );
        /*return userRepo.findByRoleAndQuery("ROLE_CLIENT", "%" + query + "%",
                pageable
        );*/
    }


    // Aktualizacja użytkownika
    public Optional<User> updateUser(UUID userUUId, User userDetails) {
        return userRepo.findByUuid(userUUId)
                .map(user -> {
                    user.setFirstName(userDetails.getFirstName());
                    user.setLastName(userDetails.getLastName());
                    // Aktualizacja hasła, jeśli podano
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    user.setEmail(userDetails.getEmail());
                    user.setRoles(userDetails.getRoles());
                    return userRepo.save(user);
                });
    }

    public Optional<User> setNonBlockedUser(UUID userUUId, boolean nonBlocked) {
        Optional<User> userOptional = userRepo.findByUuid(userUUId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setNonBlocked(nonBlocked);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }
    public Optional<User> setActiveUser(UUID userUUId, boolean active) {
        Optional<User> userOptional = userRepo.findByUuid(userUUId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setActive(active);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public Optional<User> addRoleToUser(UUID userUUId, String roleName) {
        Optional<User> userOptional = userRepo.findByUuid(userUUId);
        Optional<Role> roleOptional = roleRepo.findByName(roleName);

        if (userOptional.isPresent() && roleOptional.isPresent()) {
            User user = userOptional.get();
            Role role = roleOptional.get();
            user.getRoles().add(role);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public Optional<User> removeRoleFromUser(UUID userUUId, String roleName) {
        Optional<User> userOptional = userRepo.findByUuid(userUUId);
        Optional<Role> roleOptional = roleRepo.findByName(roleName);

        if (userOptional.isPresent() && roleOptional.isPresent()) {
            User user = userOptional.get();
            Role role = roleOptional.get();
            user.getRoles().remove(role);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }



    // Usunięcie użytkownika
    public void deleteUser(UUID userUUId) {
        userRepo.deleteByUuid(userUUId);
    }
}
