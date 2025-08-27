package com.example.ecommerce.service;

import com.example.ecommerce.dao.CustomerRepository;
import com.example.ecommerce.dto.Purchase;
import com.example.ecommerce.dto.PurchaseResponse;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import jakarta.transaction.Transactional;
import java.beans.Transient;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CheckoutServiceImpl implements CheckoutService{

  private CustomerRepository customerRepository;

  public CheckoutServiceImpl(CustomerRepository customerRepository) {
    this.customerRepository = customerRepository;
  }

  @Override
  @Transactional
  public PurchaseResponse placeOrder(Purchase purchase) {
    // Retrieve the order from the purchase object
    Order order = purchase.getOrder();
    // generate a unique tracking number
    String orderTrackingNumber = generateOrderTrackingNumber();
    order.setOrderTrackingNumber(orderTrackingNumber);

    // populate order with orderItems
    Set<OrderItem> orderItems = purchase.getOrderItems();
    orderItems.forEach(item -> order.add(item));

    //populate order with shipping and billing address
    order.setShippingAddress(purchase.getShippingAddress());
    order.setBillingAddress(purchase.getBillingAddress());

    // populate order with customer
    Customer customer = purchase.getCustomer();

    // check if the customer exists in the database
    Customer existingCustomer = customerRepository.findByEmail(customer.getEmail());
    if (existingCustomer != null) {
      // if customer exists, use the existing customer
      customer = existingCustomer;
    }

    customer.add(order);

    //save to the database
    customerRepository.save(customer);

    // return a response
    return new PurchaseResponse(orderTrackingNumber);
  }

  private String generateOrderTrackingNumber() {
    // Generate a unique tracking number for the order using UUID
    return UUID.randomUUID().toString();
  }
}
