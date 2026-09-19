import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AuthService } from './services/auth';
import { CartService } from './services/cart';
import { WishlistService } from './services/wishlist';
import { ProductsService } from './services/products';
import { ThemeService } from './services/theme';
import { UiStateService } from './services/ui-state';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    AuthService,
    CartService,
    WishlistService,
    ProductsService,
    ThemeService,
    UiStateService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  exports: []
})
export class CoreModule {}
