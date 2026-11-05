import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Usuario {
  idUsuario: number;
  usuario: string;
  nombre: string;
  rol: 'Admin' | 'Empleado';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  currentUser = signal<Usuario | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('usuario_sesion');
      if (stored) {
        try {
          this.currentUser.set(JSON.parse(stored));
        } catch {
          localStorage.removeItem('usuario_sesion');
        }
      }
    }
  }

  login(user: Usuario) {
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuario_sesion', JSON.stringify(user));
    }
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario_sesion');
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'Admin';
  }

  isEmpleado(): boolean {
    return this.currentUser()?.rol === 'Empleado';
  }
}

