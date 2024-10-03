package pl.sebakrys.diving.shop.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.sebakrys.diving.shop.entity.ShopOrder;
import pl.sebakrys.diving.shop.entity.ShopOrderItem;

@Repository
public interface ShopOrderItemRepo extends JpaRepository<ShopOrderItem, Long> {

}
