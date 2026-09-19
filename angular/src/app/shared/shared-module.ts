import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../features/shop/components/navbar/navbar';
import { Footer } from '../features/shop/components/footer/footer';

@NgModule({
  declarations: [Navbar, Footer],
  imports: [CommonModule],
  exports: [Navbar, Footer, CommonModule]
})
export class SharedModule {}
