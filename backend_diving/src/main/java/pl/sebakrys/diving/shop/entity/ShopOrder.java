package pl.sebakrys.diving.shop.entity;

import jakarta.persistence.*;
import lombok.Data;
import pl.sebakrys.diving.users.entity.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders_shop")
@Data
public class ShopOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime orderDate;

    private String status;

    @ManyToOne
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private Set<ShopOrderItem> items = new HashSet<>();
}

