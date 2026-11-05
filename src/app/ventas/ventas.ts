import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements AfterViewInit{
  @ViewChild('contenedor', { static: true }) contenedor!: ElementRef<HTMLDivElement>;
  @ViewChild('graficoLineas', { static: true }) graficoLineas!: ElementRef<SVGSVGElement>;
  @ViewChild('graficoBarras', { static: true }) graficoBarras!: ElementRef<SVGSVGElement>;

  datos: any[] = [];
  sucursales: string[] = ["Mes", "Santa Fe", "Paraná", "Santo Tome", "Rafaela", "Rosario"];
  meses: string[] = ["", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.inicializarDatos();
      this.dibujarTabla();
      this.graficarLineas();
      this.graficarBarrasApiladas();
    }
  }

  inicializarDatos() {
    for (let f = 0; f <= 12; f++) {
      this.datos[f] = ["0", "a", "a", "a", "a", "a"];
    }
    for (let f = 1; f <= 12; f++) {
      for (let c = 1; c < this.sucursales.length; c++) {
        this.datos[f][c] = Math.round(50 + Math.random() * 50);
      }
    }
  }

  dibujarTabla() {
    let tabla = "<table border='1'>";
    tabla += "<thead><tr>";
    for (let x = 0; x < this.sucursales.length; x++) {
      tabla += "<th>" + this.sucursales[x] + "</th>";
    }
    tabla += "</tr></thead><tbody>";
    for (let f = 1; f <= 12; f++) {
      tabla += "<tr>";
      tabla += "<td>" + this.meses[f] + "</td>";
      for (let c = 1; c < this.sucursales.length; c++) {
        tabla += "<td id='BGC'>" + this.datos[f][c] + "</td>";
      }
      tabla += "</tr>";
    }
    tabla += "</tbody></table>";
    this.contenedor.nativeElement.innerHTML = tabla;
  }

  graficarLinea(sucursal: number, color: string) {
    const svg = this.graficoLineas.nativeElement;
    const ancho = 600;
    const alto = 300;
    let puntos = "";

    const valores = this.datos.slice(1).map((fila) => fila[sucursal]);
    const maxValor = Math.max(...valores);

    for (let d = 0; d < valores.length; d++) {
      let x = (d / (valores.length - 1)) * ancho;
      let y = alto - (valores[d] / maxValor) * alto;
      puntos += `${x},${y} `;
    }

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", puntos.trim());
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", color);
    polyline.setAttribute("stroke-width", "2");
    svg.appendChild(polyline);
  }

  graficarLineas() {
    this.graficarLinea(1, "blue");   // Santa Fe
    this.graficarLinea(2, "red");    // Paraná
    this.graficarLinea(3, "green");  // Santo Tomé
    this.graficarLinea(4, "orange"); // Rafaela
    this.graficarLinea(5, "purple"); // Rosario
  }

  graficarBarrasApiladas() {
    const svg = this.graficoBarras.nativeElement;
    svg.innerHTML = "";

    const ancho = 600;
    const alto = 300;
    const meses = 12;
    const sucursales = 5;

    let maxTotal = 0;
    for (let f = 1; f <= meses; f++) {
      let sumaMes = 0;
      for (let c = 1; c <= sucursales; c++) {
        sumaMes += this.datos[f][c];
      }
      if (sumaMes > maxTotal) maxTotal = sumaMes;
    }

    const colores = ["blue", "red", "green", "orange", "purple"];
    const grupoAncho = ancho / meses;

    for (let f = 1; f <= meses; f++) {
      let acumulado = 0;
      for (let c = 1; c <= sucursales; c++) {
        let valor = this.datos[f][c];
        let barAlto = (valor / maxTotal) * (alto - 60);
        let x = (f - 1) * grupoAncho;
        let y = alto - acumulado - barAlto - 20;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x.toString());
        rect.setAttribute("y", y.toString());
        rect.setAttribute("width", (grupoAncho - 2).toString());
        rect.setAttribute("height", barAlto.toString());
        rect.setAttribute("fill", colores[c - 1]);
        svg.appendChild(rect);

        acumulado += barAlto;
      }

      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("x", ((f - 1) * grupoAncho + grupoAncho / 2 - 10).toString());
      texto.setAttribute("y", (alto - 5).toString());
      texto.setAttribute("font-size", "10");
      texto.textContent = this.meses[f];
      svg.appendChild(texto);
    }
  }
}
