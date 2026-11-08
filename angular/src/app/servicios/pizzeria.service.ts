
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IPedido } from '../interfaces/ipedido';

export interface Venta {
  nombre: string;
  fecha: string;
  total: number;
}

export interface RespuestaVentas {
  ventas: Venta[];
  total: number;
}

export interface RespuestaPedido {
  exito: boolean;
  idpedido: number;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class PizzeriaService {

  private api = 'http://127.0.0.1:5000';

  constructor(
    private http: HttpClient
  ) {}

  // REGISTRAR PEDIDO
  registrarPedido(pedido: IPedido) {
    return this.http.post<RespuestaPedido>(
      `${this.api}/pedidos`,
      pedido
    );
  }

  // CONSULTAR UN PEDIDO
  consultarPedido(id: number) {
    return this.http.get<any[][]>(
      `${this.api}/pedidos/${id}`
    );
  }

  // CONSULTAR TODOS LOS PEDIDOS
  consultarTodosPedidos() {
    return this.http.get<any[]>(
      `${this.api}/pedidos/todos`
    );
  }

  // VENTAS POR FECHA
  consultarVentasDia(fecha: string) {
    return this.http.get<RespuestaVentas>(
      `${this.api}/ventas/dia`,
      {
        params: {
          dia: fecha
        }
      }
    );
  }

  // VENTAS POR DIA DE LA SEMANA
  consultarVentasSemana(dia: string) {
    return this.http.get<RespuestaVentas>(
      `${this.api}/ventas/semana`,
      {
        params: {
          dia: dia
        }
      }
    );
  }

  // VENTAS POR MES
  consultarVentasMes(mes: number, ano: number) {
    return this.http.get<RespuestaVentas>(
      `${this.api}/ventas/mes`,
      {
        params: {
          mes: String(mes),
          ano: String(ano)
        }
      }
    );
  }
}
