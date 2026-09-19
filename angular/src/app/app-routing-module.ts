import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin-guard';

const routes: Routes = [
  { path: '', redirectTo: 'shop/home', pathMatch: 'full' },
  { path: 'shop', loadChildren: () => import('./features/shop/shop-module').then(m => m.ShopModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule), canActivate: [adminGuard] },
  { path: '**', redirectTo: 'shop/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
