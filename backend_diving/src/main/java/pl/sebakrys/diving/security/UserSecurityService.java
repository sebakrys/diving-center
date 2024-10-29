package pl.sebakrys.diving.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.users.dto.UserNamesDto;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserSecurityService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepo.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("Nie znaleziono użytkownika o email: " + email);
        }

        User user = userOptional.get();

        return new org.springframework.security.core.userdetails.User(
                user.getUuid().toString(),
                user.getPassword(),
                user.isActive(),
                true, true,
                user.isNonBlocked(),
                user.getRoles()
        );
    }

    public UserDetails loadUserByUuid(String uuid) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(uuid)); // *** Nowa metoda ***
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("Nie znaleziono użytkownika o UUID: " + uuid);
        }

        User user = userOptional.get();

        return new org.springframework.security.core.userdetails.User(
                user.getUuid().toString(),
                user.getPassword(),
                user.isActive(),
                true, true,
                user.isNonBlocked(),
                user.getRoles()
        );
    }

    public User getUserByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        System.out.println("request.getHeader(\"Authorization\"): "+authHeader);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij uuid z tokena
            String UuidString = jwtUtil.extractSubject(oldToken);
            Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(UuidString));

            if(userOptional.isPresent()){
                User user = userOptional.get();
                return user;
            }
        }
        return null;
    }

    public UserNamesDto getUserNamesByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij uuid z tokena
            String UuidString = jwtUtil.extractSubject(oldToken);
            Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(UuidString));

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
            // Wyodrębnij uuid z tokena
            String UuidString = jwtUtil.extractSubject(oldToken);
            Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(UuidString));

            if(userOptional.isPresent()){
                User user = userOptional.get();
                Long userId = user.getId();
                return userId;
            }
        }
        return null;
    }


    public UUID getUserUUIdByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij uuid z tokena
            String UuidString = jwtUtil.extractSubject(oldToken);
            Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(UuidString));

            if(userOptional.isPresent()){
                User user = userOptional.get();
                UUID userUUId = user.getUuid();
                return userUUId;
            }
        }
        return null;
    }

    public List<String> getUserRolesByAuthTokenRequest(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            // Wyodrębnij nazwę użytkownika z tokena
            String UuidString = jwtUtil.extractSubject(oldToken);
            Optional<User> userOptional = userRepo.findByUuid(UUID.fromString(UuidString));

            if(userOptional.isPresent()){
                User user = userOptional.get();
                List<Role> roleList = new ArrayList<>(user.getRoles());
                List<String> roles = new ArrayList<>();
                for (Role role:
                        roleList) {
                    roles.add(role.getName());
                }

                return roles;
            }
        }
        return new ArrayList<>();
    }

}
