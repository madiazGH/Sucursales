import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];
  nuevoUsuario = '';
  nuevoPassword = '';
  nuevoNombre = '';
  errorMsg = '';
  exitoMsg = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>('/api/usuarios').subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  agregarEmpleado() {
    if (!this.nuevoUsuario || !this.nuevoPassword || !this.nuevoNombre) {
      this.errorMsg = 'Completá todos los campos para agregar un empleado';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    this.exitoMsg = '';

    const payload = {
      usuario: this.nuevoUsuario,
      password: this.nuevoPassword,
      nombre: this.nuevoNombre,
      rol: 'Empleado'
    };

    this.http.post<any>('/api/usuarios', payload).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoMsg = 'Empleado agregado con éxito';
        this.nuevoUsuario = '';
        this.nuevoPassword = '';
        this.nuevoNombre = '';
        this.cargarUsuarios();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Error al agregar empleado';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(id: number, rol: string) {
    if (rol === 'Admin') {
      alert('No podés eliminar la cuenta de Administrador');
      return;
    }

    if (!confirm('¿Seguro que querés eliminar este usuario?')) {
      return;
    }

    this.http.delete(`/api/usuarios/${id}`).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al eliminar usuario');
      }
    });
  }
}

