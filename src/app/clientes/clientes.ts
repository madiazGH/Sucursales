import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit{
  public clients:any=[];

  // Formulario Admin
  nombre = '';
  apellido = '';
  dni: number | null = null;
  situacionFiscal = 'Consumidor Final';
  errorMsg = '';
  cargando = false;

  situaciones = [
    'Consumidor Final',
    'Responsable Inscripto',
    'Monotributista',
    'Exento',
    'No Categorizado'
  ];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get<any[]>('/api/clientes').subscribe({
      next: (data) => {
        this.clients = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  agregarCliente() {
    if (!this.nombre || !this.apellido || !this.dni) {
      this.errorMsg = 'Completá nombre, apellido y DNI del cliente';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    const payload = {
      nombre: this.nombre,
      apellido: this.apellido,
      dni: this.dni,
      situacionFiscal: this.situacionFiscal
    };

    this.http.post<any>('/api/clientes', payload).subscribe({
      next: () => {
        this.cargando = false;
        this.nombre = '';
        this.apellido = '';
        this.dni = null;
        this.situacionFiscal = 'Consumidor Final';
        this.cargarClientes();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Error al agregar cliente';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCliente(id: number) {
    if (!confirm('¿Seguro que querés eliminar este cliente?')) {
      return;
    }

    this.http.delete(`/api/clientes/${id}`).subscribe({
      next: () => {
        this.cargarClientes();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al eliminar cliente');
      }
    });
  }
}

