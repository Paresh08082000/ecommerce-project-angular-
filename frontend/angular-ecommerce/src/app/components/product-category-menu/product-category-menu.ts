import { ProductService } from './../../services/product';
import { ProductCategory } from './../../common/product-category';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-category-menu',
  standalone: false,
  templateUrl: './product-category-menu.html',
  styleUrl: './product-category-menu.css'
})
export class ProductCategoryMenu implements OnInit {
  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService) {};
  ngOnInit() {
    this.listProductCategories();
  }
  listProductCategories() {
    this.productService.getProductCategories().subscribe(
      data => {
        console.log('Product Categories: ', JSON.stringify(data));
        this.productCategories = data;
      }
    );
  }
}
