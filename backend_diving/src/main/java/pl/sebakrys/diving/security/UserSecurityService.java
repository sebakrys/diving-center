package pl.sebakrys.diving.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserSecurityService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

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

}
