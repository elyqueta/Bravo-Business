import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopLayout } from './components/shop-layout/shop-layout';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Wishlist } from './pages/wishlist/wishlist';

const routes: Routes = [
  {
    path: '',
    component: ShopLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'products', component: Products },
      { path: 'products/:category', component: Products },
      { path: 'product/:id', component: ProductDetail },
      { path: 'cart', component: Cart },
      { path: 'wishlist', component: Wishlist },
      { path: '**', redirectTo: 'home' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule {}
