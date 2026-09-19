import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopRoutingModule } from './shop-routing-module';
import { SharedModule } from '@shared/shared-module';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Wishlist } from './pages/wishlist/wishlist';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { HeroSlider } from './components/hero-slider/hero-slider';
import { ProductCard } from './components/product-card/product-card';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { WishlistDrawer } from './components/wishlist-drawer/wishlist-drawer';
import { ProductModal } from './components/product-modal/product-modal';
import { CategoryNav } from './components/category-nav/category-nav';
import { Features } from './components/features/features';
import { Promo } from './components/promo/promo';
import { ShopLayout } from './components/shop-layout/shop-layout';

@NgModule({
  declarations: [
    Home,
    Products,
    ProductDetail,
    Cart,
    Wishlist,
    HeroSlider,
    ProductCard,
    CartDrawer,
    WishlistDrawer,
    ProductModal,
    CategoryNav,
    Features,
    Promo,
    ShopLayout,
  ],
  imports: [CommonModule, RouterModule, ShopRoutingModule, SharedModule],
  exports: [ShopRoutingModule, Navbar, Footer, ProductModal, CartDrawer, WishlistDrawer],
})
export class ShopModule {}
