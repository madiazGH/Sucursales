import { Component , OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sucursales',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css'
})
export class Sucursales implements OnInit{
  suc:any = [];

  // Formulario Admin
  nombre = '';
  ciudad = '';
  direccion = '';
  cantempleado = 1;
  errorMsg = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.http.get<any[]>('/api/sucursales').subscribe({
      next: (data) => {
        this.suc = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar sucursales:', err)
    });
  }

  agregarSucursal() {
    if (!this.nombre || !this.ciudad || !this.direccion) {
      this.errorMsg = 'Completá todos los campos de la sucursal';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    const payload = {
      nombre: this.nombre,
      ciudad: this.ciudad,
      direccion: this.direccion,
      cantempleado: this.cantempleado || 0
    };

    this.http.post<any>('/api/sucursales', payload).subscribe({
      next: () => {
        this.cargando = false;
        this.nombre = '';
        this.ciudad = '';
        this.direccion = '';
        this.cantempleado = 1;
        this.cargarSucursales();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Error al agregar sucursal';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarSucursal(id: number) {
    if (!confirm('¿Seguro que querés eliminar esta sucursal?')) {
      return;
    }

    this.http.delete(`/api/sucursales/${id}`).subscribe({
      next: () => {
        this.cargarSucursales();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al eliminar sucursal');
      }
    });
  }
}

