import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Ventas } from './ventas/ventas';
import { Sucursales } from './sucursales/sucursales';
import { Clientes } from './clientes/clientes';
import { Login } from './login/login';
import { Usuarios } from './usuarios/usuarios';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'sucursales', component: Sucursales },
  { path: 'login', component: Login },
  { path: 'ventas', component: Ventas, canActivate: [authGuard] },
  { path: 'clientes', component: Clientes, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [adminGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
