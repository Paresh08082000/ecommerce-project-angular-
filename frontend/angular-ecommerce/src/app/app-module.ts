import { Injector, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ProductList } from './components/product-list/product-list';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { ProductService } from './services/product';
import { RouterModule, Route, Router } from '@angular/router';
import { ProductCategoryMenu } from './components/product-category-menu/product-category-menu';
import { Search } from './components/search/search';
import { ProductDetails } from './components/product-details/product-details';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CartStatus } from './components/cart-status/cart-status';
import { CartDetails } from './components/cart-details/cart-details';
import { Checkout } from './components/checkout/checkout';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginStatus } from './components/login-status/login-status';
import { AuthGuard, AuthHttpInterceptor, AuthModule, AuthService } from '@auth0/auth0-angular';
import myAppConfig from './config/my-app-config';
import { AuthInterceptor } from './services/auth-interceptor';
import { MembersPage } from './components/members-page/members-page';
import { OrderHistoryComponent } from './components/order-history/order-history';

const routes: Route[] = [
  {path: 'search/:keyword', component: ProductList},
  {path: 'category/:id/:name', component: ProductList},
  {path: 'category', component: ProductList},
  {path: 'products', component: ProductList},
  {path: 'products/:id', component: ProductDetails},
  {path: 'cart-details', component: CartDetails},
  {path: 'checkout', component: Checkout},
  { 
  path: 'members',
  component: MembersPage,
  canActivate: [AuthGuard],
  data: { appState: { target: '/members' } }
  },
  {path:'order-history',component:OrderHistoryComponent,canActivate:[AuthGuard]},
  {path: '', redirectTo: '/products', pathMatch: 'full'},
  {path: '**', redirectTo: '/products', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    App,
    ProductList,
    ProductCategoryMenu,
    Search,
    ProductDetails,
    CartStatus,
    CartDetails,
    Checkout,
    LoginStatus,
    MembersPage,
    OrderHistoryComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    AuthModule.forRoot({
      ...myAppConfig.auth,
      httpInterceptor: {
        ...myAppConfig.httpInterceptor,
      },
    }),
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    ProductService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  bootstrap: [App]
})
export class AppModule { }
