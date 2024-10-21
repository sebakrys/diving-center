package pl.sebakrys.diving.users.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    List<User> findAllByOrderByIdAsc();
    Optional<User> findByEmail(String email);


    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :role AND " +
            "(u.firstName LIKE %:query% OR u.lastName LIKE %:query% OR u.email LIKE %:query%)")
    List<User> findByRoleAndQuery(@Param("role") String role, @Param("query") String query);

}
