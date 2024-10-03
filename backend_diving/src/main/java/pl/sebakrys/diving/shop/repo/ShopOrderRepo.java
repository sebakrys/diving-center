package pl.sebakrys.diving.shop.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.shop.entity.ShopOrder;

@Repository
public interface ShopOrderRepo extends JpaRepository<ShopOrder, Long> {

}
