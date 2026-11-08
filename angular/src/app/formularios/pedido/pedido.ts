
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { PizzeriaService } from '../../servicios/pizzeria.service';
import { IPedido } from '../../interfaces/ipedido';

interface Pizza {
  tamano: string;
  ingredientes: string;
  numero_pizzas: number;
  subtotal: number;
}

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './pedido.html'
})
export class Pedido {

  // FORMULARIO REACTIVO
  formularioCliente = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    }),

    direccion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    telefono: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9+\s()-]{7,20}$/)
      ]
    }),

    fecha: new FormControl(this.obtenerFechaLocal(), {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  // DATOS DE PIZZA
  tamano = 'Chico';
  ingredientes: string[] = [];
  numero_pizzas = 1;

  pizzas: Pizza[] = [];

  precios: Record<string, number> = {
    Chico: 40,
    Mediano: 80,
    Grande: 120
  };

  listaIngredientes: string[] = [
    'Jamón',
    'Piña',
    'Champiñones'
  ];

  precioIngrediente = 10;

  mensaje = '';
  error = '';
  guardando = false;

  constructor(
    private servicio: PizzeriaService
  ) {}

  // FECHA ACTUAL
  obtenerFechaLocal(): string {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // INGREDIENTES
  seleccionarIngrediente(
    ingrediente: string,
    seleccionado: boolean
  ): void {

    if (seleccionado) {
      if (!this.ingredientes.includes(ingrediente)) {
        this.ingredientes.push(ingrediente);
      }
    } else {
      this.ingredientes = this.ingredientes.filter(
        item => item !== ingrediente
      );
    }
  }

  // AGREGAR
  agregar(): void {
    this.mensaje = '';
    this.error = '';

    const cantidad = Number(this.numero_pizzas);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.error = 'Ingresa una cantidad válida.';
      return;
    }

    const precioBase = this.precios[this.tamano];

    if (precioBase === undefined) {
      this.error = 'Selecciona un tamaño válido.';
      return;
    }

    const costoIngredientes =
      this.ingredientes.length * this.precioIngrediente;

    const subtotal =
      (precioBase + costoIngredientes) * cantidad;

    this.pizzas.push({
      tamano: this.tamano,
      ingredientes: this.ingredientes.join(', '),
      numero_pizzas: cantidad,
      subtotal
    });

    this.tamano = 'Chico';
    this.ingredientes = [];
    this.numero_pizzas = 1;

    this.mensaje = 'Pizza agregada correctamente.';
  }

  // QUITAR
  quitar(indice: number): void {
    if (indice < 0 || indice >= this.pizzas.length) {
      return;
    }

    this.pizzas.splice(indice, 1);
    this.mensaje = 'Pizza eliminada del pedido.';
    this.error = '';
  }

  // TOTAL
  get total(): number {
    return this.pizzas.reduce(
      (suma, pizza) => suma + pizza.subtotal,
      0
    );
  }

  // TERMINAR
  terminar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.guardando) {
      return;
    }

    if (this.formularioCliente.invalid) {
      this.formularioCliente.markAllAsTouched();

      this.error =
        'Completa correctamente los datos del cliente.';

      return;
    }

    if (this.pizzas.length === 0) {
      this.error = 'Agrega al menos una pizza.';
      return;
    }

    const datos = this.formularioCliente.getRawValue();
    const totalPagar = this.total;

    const pedido: IPedido = {
      cliente: {
        nombre: datos.nombre.trim(),
        direccion: datos.direccion.trim(),
        telefono: datos.telefono.trim()
      },
      fecha: datos.fecha,
      total: totalPagar,
      pizzas: this.pizzas.map(pizza => ({
        tamano: pizza.tamano,
        ingredientes: pizza.ingredientes,
        numero_pizzas: pizza.numero_pizzas,
        subtotal: pizza.subtotal
      }))
    };

    this.guardando = true;

    this.servicio.registrarPedido(pedido).subscribe({
      next: respuesta => {
        this.guardando = false;

        if (respuesta.exito) {
          this.mensaje =
            `Pedido #${respuesta.idpedido} registrado correctamente. ` +
            `Total a pagar: $${totalPagar.toFixed(2)} MXN`;

          this.formularioCliente.reset({
            nombre: '',
            direccion: '',
            telefono: '',
            fecha: this.obtenerFechaLocal()
          });

          this.tamano = 'Chico';
          this.ingredientes = [];
          this.numero_pizzas = 1;
          this.pizzas = [];
        } else {
          this.error =
            respuesta.mensaje || 'No se pudo registrar el pedido.';
        }
      },

      error: error => {
        console.error(error);
        this.guardando = false;

        this.error =
          error.error?.mensaje ||
          'Error al guardar. Revisa Flask y MySQL.';
      }
    });
  }
}
