import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayout } from './components/admin-layout/admin-layout';

const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'products', loadChildren: () => import('./admin-products-module').then(m => m.AdminProductsModule) },
      { path: 'orders', loadChildren: () => import('./admin-orders-module').then(m => m.AdminOrdersModule) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
