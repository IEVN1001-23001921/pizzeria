
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import {
  PizzeriaService,
  Venta,
  RespuestaVentas
} from '../../servicios/pizzeria.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './ventas.html'
})
export class Ventas implements OnInit, OnDestroy {

  // FECHA ESPECIFICA
  fecha = '';
  fechaConsultada = '';
  ventasDia: Venta[] = [];
  totalDia = 0;
  consultadoDia = false;

  // DIA DE LA SEMANA
  diasSemana = [
    { nombre: 'Lunes', valor: 'lunes' },
    { nombre: 'Martes', valor: 'martes' },
    { nombre: 'Miércoles', valor: 'miercoles' },
    { nombre: 'Jueves', valor: 'jueves' },
    { nombre: 'Viernes', valor: 'viernes' },
    { nombre: 'Sábado', valor: 'sabado' },
    { nombre: 'Domingo', valor: 'domingo' }
  ];

  diaSemanaSeleccionado = 'lunes';
  diaSemanaConsultado = '';

  ventasSemana: Venta[] = [];
  totalSemana = 0;
  consultadoSemana = false;

  // MES
  meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  mes = new Date().getMonth() + 1;
  ano = new Date().getFullYear();

  mesConsultado = '';
  ventasMes: Venta[] = [];
  totalMes = 0;
  consultadoMes = false;

  // MENSAJES
  errorDia = '';
  errorSemana = '';
  errorMes = '';

  cargandoDia = false;
  cargandoSemana = false;
  cargandoMes = false;

  private actualizacion?: Subscription;
  private peticionDia?: Subscription;
  private peticionSemana?: Subscription;
  private peticionMes?: Subscription;

  constructor(
    private servicio: PizzeriaService
  ) {}

  ngOnInit(): void {
    this.fecha = this.obtenerFechaLocal();

    // Consultar ventas de hoy al abrir la pagina.
    this.consultarDia();

    // Actualizar cada 5 segundos.
    this.actualizacion = interval(5000).subscribe(() => {
      if (!this.cargandoDia) {
        this.consultarDia();
      }
    });
  }

  ngOnDestroy(): void {
    this.actualizacion?.unsubscribe();
    this.peticionDia?.unsubscribe();
    this.peticionSemana?.unsubscribe();
    this.peticionMes?.unsubscribe();
  }

  obtenerFechaLocal(): string {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  // CONSULTAR VENTAS POR FECHA
  consultarDia(): void {
    if (!this.fecha) {
      this.errorDia = 'Selecciona una fecha.';
      return;
    }

    const fechaSolicitada = this.fecha;

    this.peticionDia?.unsubscribe();
    this.cargandoDia = true;
    this.errorDia = '';

    this.peticionDia = this.servicio
      .consultarVentasDia(fechaSolicitada)
      .subscribe({
        next: (respuesta: RespuestaVentas) => {
          this.ventasDia = respuesta.ventas || [];
          this.totalDia = Number(respuesta.total || 0);

          this.fechaConsultada = fechaSolicitada;
          this.consultadoDia = true;
          this.cargandoDia = false;
        },

        error: error => {
          console.error(error);

          this.errorDia =
            'No se pudieron consultar las ventas de la fecha.';

          this.cargandoDia = false;
        }
      });
  }

  // CONSULTAR VENTAS POR DIA DE LA SEMANA
  consultarDiaSemana(): void {
    const diaSolicitado = this.diaSemanaSeleccionado;

    this.peticionSemana?.unsubscribe();
    this.cargandoSemana = true;
    this.errorSemana = '';

    this.peticionSemana = this.servicio
      .consultarVentasSemana(diaSolicitado)
      .subscribe({
        next: (respuesta: RespuestaVentas) => {
          this.ventasSemana = respuesta.ventas || [];
          this.totalSemana = Number(respuesta.total || 0);

          const dia = this.diasSemana.find(
            item => item.valor === diaSolicitado
          );

          this.diaSemanaConsultado =
            dia?.nombre || diaSolicitado;

          this.consultadoSemana = true;
          this.cargandoSemana = false;
        },

        error: error => {
          console.error(error);

          this.errorSemana =
            'No se pudieron consultar las ventas del día de la semana.';

          this.cargandoSemana = false;
        }
      });
  }

  // CONSULTAR VENTAS POR MES
  consultarMes(): void {
    const mesSolicitado = Number(this.mes);
    const anoSolicitado = Number(this.ano);

    if (
      !Number.isInteger(mesSolicitado) ||
      mesSolicitado < 1 ||
      mesSolicitado > 12 ||
      !Number.isInteger(anoSolicitado) ||
      anoSolicitado < 1
    ) {
      this.errorMes = 'Selecciona un mes y año válidos.';
      return;
    }

    this.peticionMes?.unsubscribe();
    this.cargandoMes = true;
    this.errorMes = '';

    this.peticionMes = this.servicio
      .consultarVentasMes(mesSolicitado, anoSolicitado)
      .subscribe({
        next: (respuesta: RespuestaVentas) => {
          this.ventasMes = respuesta.ventas || [];
          this.totalMes = Number(respuesta.total || 0);

          this.mesConsultado =
            `${this.meses[mesSolicitado - 1]} ${anoSolicitado}`;

          this.consultadoMes = true;
          this.cargandoMes = false;
        },

        error: error => {
          console.error(error);

          this.errorMes =
            'No se pudieron consultar las ventas del mes.';

          this.cargandoMes = false;
        }
      });
  }
}
