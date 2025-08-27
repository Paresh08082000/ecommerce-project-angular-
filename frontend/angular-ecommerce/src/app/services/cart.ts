import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  storage: Storage = sessionStorage

  constructor() {
    // read data from session storage
    const data = JSON.parse(this.storage.getItem('cartItems'));
    if (data) {
      this.cartItems = data;
      // compute totals based on the data read from storage
      this.calculateCartTotals();
    }
  }

  addToCart(theCartItem: CartItem) {
    // Check if the item already exists in the cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.length > 0) {
      // If it exists, increase the quantity
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);

      alreadyExistsInCart = (existingCartItem !== undefined);
    }
 
    if (alreadyExistsInCart && existingCartItem) {
      // Increase the quantity
      existingCartItem.quantity++;
    } else {
      // Add the new item to the cart
      this.cartItems.push(theCartItem);
    }

    // Calculate the total price and quantity
    this.calculateCartTotals();
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      // Remove the item from the cart
      this.remove(theCartItem);
    } else {
      // Update the total price and quantity
      this.calculateCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // Find the index of the item to remove
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    // If found, remove it from the cart
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.calculateCartTotals();
    }
  }

  calculateCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    // Publish the new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
}
