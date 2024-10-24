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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserSecurityService userSecurityService;

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

        System.out.println("Szyfrowanie hasła: " + user.getPassword());
        // Szyfrowanie hasła
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        System.out.println("Ustawienie domyślnej roli, jeśli nie podano");

        // Ustawienie domyślnej roli, jeśli nie podano
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role userRole = roleRepo.findByName("ROLE_CLIENT")
                    .orElseGet(() -> {
                        // Jeśli rola nie istnieje, utwórz ją i zapisz
                        Role newRole = new Role();
                        newRole.setName("ROLE_CLIENT");
                        roleRepo.save(newRole);
                        return newRole;
                    });

            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            user.setRoles(roles);
        }

        user.setActive(true);
        user.setNonBlocked(true);

        return userRepo.save(user);
    }


    // Pobranie użytkownika po ID
    public Optional<User> getUserById(Long userId) {
        return userRepo.findById(userId);
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

    public UserNamesDto getUserNamesByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij nazwę użytkownika z tokena
            String email = jwtUtil.extractUsername(oldToken);
            Optional<User> userOptional = userRepo.findByEmail(email);
            if(userOptional.isPresent()){
                User user = userOptional.get();
                UserNamesDto userNamesDto = new UserNamesDto(user.getFirstName(), user.getLastName(), user.getEmail());
                return userNamesDto;
            }
        }
        return null;
    }

    public Long getUserIdByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij nazwę użytkownika z tokena
            String email = jwtUtil.extractUsername(oldToken);
            Optional<User> userOptional = userRepo.findByEmail(email);
            if(userOptional.isPresent()){
                User user = userOptional.get();
                Long userId = user.getId();
                return userId;
            }
        }
        return null;
    }

    // Aktualizacja użytkownika
    public Optional<User> updateUser(Long userId, User userDetails) {
        return userRepo.findById(userId)
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

    public Optional<User> setNonBlockedUser(Long userId, boolean nonBlocked) {
        Optional<User> userOptional = userRepo.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setNonBlocked(nonBlocked);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }
    public Optional<User> setActiveUser(Long userId, boolean active) {
        Optional<User> userOptional = userRepo.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setActive(active);
            userRepo.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public Optional<User> addRoleToUser(Long userId, String roleName) {
        Optional<User> userOptional = userRepo.findById(userId);
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

    public Optional<User> removeRoleFromUser(Long userId, String roleName) {
        Optional<User> userOptional = userRepo.findById(userId);
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
    public void deleteUser(Long userId) {
        userRepo.deleteById(userId);
    }
}
