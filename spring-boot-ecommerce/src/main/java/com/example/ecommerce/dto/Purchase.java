package com.example.ecommerce.dto;

import com.example.ecommerce.entity.Address;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import java.util.Set;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Purchase {
  private Customer customer;
  private Address shippingAddress;
  private Address billingAddress;
  private Order order;
  private Set<OrderItem> orderItems;
}
