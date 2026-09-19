import { Routes } from "@angular/router";
import { HomePageComponent } from "./features/shop/home/home-page.component";
import { CatalogPageComponent } from "./features/shop/catalog/catalog-page.component";
import { ContactosPageComponent } from "./features/shop/contactos/contactos-page.component";
import { CartPageComponent } from "./features/shop/account/cart-page.component";
import { WishlistPageComponent } from "./features/shop/account/wishlist-page.component";
import { AdminPageComponent } from "./features/admin/admin-page.component";
import { InfoPageComponent } from "./features/info/info-page.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "loja" },
  { path: "home", redirectTo: "loja", pathMatch: "full" },
  { path: "loja", component: HomePageComponent },
  { path: "loja/produtos", component: CatalogPageComponent },
  { path: "loja/carrinho", component: CartPageComponent },
  { path: "loja/favoritos", component: WishlistPageComponent },
  { path: "loja/produto/:id", component: CatalogPageComponent },
  { path: "loja/:category", component: CatalogPageComponent },
  { path: "contactos", component: ContactosPageComponent },
  { path: "admin", component: AdminPageComponent },
  {
    path: "sobre",
    component: InfoPageComponent,
    data: {
      title: "Sobre Nós",
      text: "Conhece a história e a visão da Bravo Business.",
    },
  },
  {
    path: "trocas",
    component: InfoPageComponent,
    data: {
      title: "Política de Trocas",
      text: "Trocas simples e transparentes até 7 dias após a compra.",
    },
  },
  {
    path: "privacidade",
    component: InfoPageComponent,
    data: {
      title: "Privacidade",
      text: "A tua privacidade é importante para nós.",
    },
  },
  {
    path: "termos",
    component: InfoPageComponent,
    data: {
      title: "Termos & Condições",
      text: "Consulta as condições de utilização da loja.",
    },
  },
  { path: "**", redirectTo: "loja" },
];
