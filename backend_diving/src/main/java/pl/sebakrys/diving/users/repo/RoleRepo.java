package pl.sebakrys.diving.users.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.shop.entity.ShopOrder;
import pl.sebakrys.diving.users.entity.Role;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {

}
