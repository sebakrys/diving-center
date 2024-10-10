package pl.sebakrys.diving.users.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
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
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepo userRepo, RoleRepo roleRepo, BCryptPasswordEncoder passwordEncoder) {
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


    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepo.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("Nie znaleziono użytkownika o email: " + email);
        }

        User user = userOptional.get();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),
                true, true, true,
                user.getRoles()
        );
    }


    // Pobranie wszystkich użytkowników
    public List<User> getAllUsers() {
        return userRepo.findAll();
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
