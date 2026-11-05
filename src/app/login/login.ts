import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = '';
  password = '';
  errorMsg = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    if (!this.usuario || !this.password) {
      this.errorMsg = 'Completa el usuario y la contraseña';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    this.http.post<any>('/api/login', { usuario: this.usuario, password: this.password }).subscribe({
      next: (user) => {
        this.cargando = false;
        this.authService.login(user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Error al iniciar sesión';
        this.cdr.detectChanges();
      }
    });
  }
}

