package pl.sebakrys.diving.users.repo;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.users.entity.Role;
import pl.sebakrys.diving.users.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    void deleteByUuid(UUID uuid);
    List<User> findAllByOrderByIdAsc();
    Optional<User> findByEmail(String email);

    Optional<User> findByUuid(UUID uuid);


    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :role AND " +
            "(upper(u.firstName) LIKE upper(%:query%) OR upper(u.lastName) LIKE upper(%:query%) OR upper(u.email) LIKE upper(%:query%))")
    List<User> findByRoleAndQuery(@Param("role") String role, @Param("query") String query, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :role AND " +
            "(upper(u.firstName) LIKE upper(CONCAT('%', :query, '%')) OR " +
            "upper(u.lastName) LIKE upper(CONCAT('%', :query, '%')) OR " +
            "upper(u.email) LIKE upper(CONCAT('%', :query, '%'))) AND " +
            "u.id NOT IN (SELECT uc.id FROM Course c JOIN c.users uc WHERE c.id = :courseId)")
    List<User> findByRoleAndQueryExcludingCourse(
            @Param("role") String role,
            @Param("query") String query,
            @Param("courseId") Long courseId,
            Pageable pageable);



}
