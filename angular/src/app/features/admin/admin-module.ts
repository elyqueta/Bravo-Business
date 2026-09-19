import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

@NgModule({
  declarations: [AdminLayout, Login, Dashboard],
  imports: [CommonModule, FormsModule, AdminRoutingModule],
  exports: [AdminRoutingModule]
})
export class AdminModule {}
