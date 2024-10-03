package pl.sebakrys.diving.shop.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pl.sebakrys.diving.shop.entity.ShopProduct;

@Repository
public interface ShopProductRepo extends JpaRepository<ShopProduct, Long> {

}
