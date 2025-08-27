import { Country } from './../../common/country';
import { CartService } from './../../services/cart';
import { CheckoutService } from './../../services/checkout';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { zip } from 'rxjs';
import { Luv2ShopForm } from '../../services/luv2-shop-form';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  checkoutFormGroup: FormGroup = new FormGroup({});

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;
  
  constructor(private formBuilder: FormBuilder,
              private luv2ShopForm: Luv2ShopForm,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router
  ) {}

  ngOnInit(): void {

    this.reviewCartDetails();

    const userEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        lastName: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        email: [userEmail,
          [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]]
      }),
      shippingAddress: this.formBuilder.group({
        street: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        city: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        state: ['',[Validators.required]],
        country: ['',[Validators.required]],
        zipCode: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
      }),
      billingAddress: this.formBuilder.group({
        street: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        city: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
      }),
      creditCard: this.formBuilder.group({
        cardType: ['', [Validators.required]],
        nameOnCard: ['',
          [Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace]],
        cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3}')]],
        expirationMonth: [''],
        expirationYear: ['']
      })
    })

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;

    this.luv2ShopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

    //populate credit card years
    this.luv2ShopForm.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    );

    //populate countries
    this.luv2ShopForm.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const target = event.target as HTMLInputElement; // Cast the event target to an HTMLInputElement
    if (target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates; // Copy states from shipping to billing
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = []; // Reset billing address states
    }
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() {return this.checkoutFormGroup.get('creditCard.cardType')}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard')}
  get creditCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber')}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('creditCard.securityCode')}

  reviewCartDetails(){
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    );

    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );
  }

  onSubmit() {
    console.log('Handling the submit button');

    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    // set up order
    let order = new Order(this.totalQuantity, this.totalPrice);

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cart items
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    //populate purchase - customer, shippingAddress, billingAddress, order, orderItems
    const customer = this.checkoutFormGroup.controls['customer'].value;
    const shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;

    // Fix state and country names for shipping and billing addresses
    const shippingState = JSON.parse(JSON.stringify(shippingAddress.state));
    const shippingCountry = JSON.parse(JSON.stringify(shippingAddress.country));
    shippingAddress.state = shippingState.name;
    shippingAddress.country = shippingCountry.name;

    const billingState = JSON.parse(JSON.stringify(billingAddress.state));
    const billingCountry = JSON.parse(JSON.stringify(billingAddress.country));
    billingAddress.state = billingState.name;
    billingAddress.country = billingCountry.name;

    let purchase = new Purchase(
      customer,
      shippingAddress,
      billingAddress,
      order,
      orderItems
    );

    console.log(JSON.stringify(purchase));

    // call REST API via the checkout service
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
        // reset cart after successful order
        this.resetCart();
        // navigate to the order confirmation page
        this.router.navigateByUrl('/order-confirmation');
      },
      error: err => {
        alert(`There was an error while placing your order: ${err.message}`);
      }
    });
  }

  resetCart() {
    // Reset the cart items
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // Reset the checkout form
    this.checkoutFormGroup.reset();

    // Navigate to the products page
    this.router.navigateByUrl('/products');
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    let startMonth: number;
    if( selectedYear == currentYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.luv2ShopForm.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        // Set the first state as default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

}
