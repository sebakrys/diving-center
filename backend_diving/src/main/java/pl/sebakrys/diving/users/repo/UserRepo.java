package pl.sebakrys.diving.users.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    List<User> findAllByOrderByIdAsc();
    Optional<User> findByEmail(String email);

}
