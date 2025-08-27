import { Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list-grid.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1; // Default category ID
  previousCategoryId: number = 1; // To track the previous category ID
  currentCategoryName: string = 'Books'; // Default category name
  searchMode: boolean = false;
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = '';

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();
    }
  }

  handleSearchProducts(){
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have different previous keyword and current keyword
    // then set thePageNumber to 1
    if(this.previousKeyword !== theKeyword){
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword}, pageNumber=${this.thePageNumber}`);

    this.productService.searchProductsPaginate(this.thePageNumber-1, this.thePageSize, theKeyword).subscribe(
      this.processResult()
    );
  }

  processResult(){
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1; // Adjust for zero-based index
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  handleListProducts() {
    // Check if a category ID is provided in the route
    const hasCategoryId = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // COnvert the category ID from string to number
      // Use the '+' operator to convert the string to a number
      // The '!' operator asserts that the value is not null or undefined
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      // get the category name from the route
      const categoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      this.currentCategoryId = 1; // Default category ID if not provided
      this.currentCategoryName = 'Books'; // Default category ID
    }

    if (this.previousCategoryId !== this.currentCategoryId) {
      console.log(`Category changed from ${this.previousCategoryId} to ${this.currentCategoryId}`);
      this.thePageNumber = 1; // Reset to first page if category changes
    }

    this.productService.getProductListPaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(
        this.processResult()
      )
  }

  updatePageSize(updatePageSize: string) {
    this.thePageSize = +updatePageSize;
    this.thePageNumber = 1;
    this.listProducts(); // Refresh the product list with the new page size
  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart: ${theProduct.name}, ID: ${theProduct.unitPrice}`);
    // Create a new CartItem from the Product
    const cartItem = new CartItem(theProduct);
    // Here you would typically call a service to add the product to the cart
    this.cartService.addToCart(cartItem);
  }
}
