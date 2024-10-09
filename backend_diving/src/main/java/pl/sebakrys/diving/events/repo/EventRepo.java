package pl.sebakrys.diving.events.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.events.entity.Event;
import pl.sebakrys.diving.events.entity.EventRegistration;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepo extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE e.startDate BETWEEN :startDate AND :endDate")
    List<Event> findAllByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);


}
