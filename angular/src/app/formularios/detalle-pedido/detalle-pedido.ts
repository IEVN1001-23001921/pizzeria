
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PizzeriaService } from '../../servicios/pizzeria.service';

interface Pizza {
  tamano: string;
  ingredientes: string;
  numero_pizzas: number;
  subtotal: number;
}

interface Pedido {
  idpedido: number;
  nombre: string;
  direccion: string;
  telefono: string;
  fecha: string;
  total: number;
  pizzas: Pizza[];
}

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './detalle-pedido.html'
})
export class DetallePedido implements OnInit {

  pedidos: Pedido[] = [];
  filtro = '';
  cargando = false;
  mensaje = '';

  constructor(private servicio: PizzeriaService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.mensaje = '';

    this.servicio.consultarTodosPedidos().subscribe({
      next: (respuesta: Pedido[]) => {
        this.pedidos = respuesta;
        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los pedidos.';
        this.cargando = false;
      }
    });
  }

  get pedidosFiltrados(): Pedido[] {
    const busqueda = this.filtro.trim().toLowerCase();

    if (!busqueda) {
      return this.pedidos;
    }

    return this.pedidos.filter(p =>
      String(p.idpedido).includes(busqueda) ||
      p.nombre.toLowerCase().includes(busqueda)
    );
  }
}
