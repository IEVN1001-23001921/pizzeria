import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'pedido',
    pathMatch: 'full'
  },

  {
    path: 'pedido',
    loadComponent: () =>
      import('./formularios/pedido/pedido')
        .then(c => c.Pedido)
  },

  {
    path: 'detalle-pedido',
    loadComponent: () =>
      import('./formularios/detalle-pedido/detalle-pedido')
        .then(c => c.DetallePedido)
  },
  {
  path: 'detalle-pedido',
  loadComponent: () =>
    import('./formularios/detalle-pedido/detalle-pedido')
      .then(c => c.DetallePedido)
},
{
  path: 'ventas',
  loadComponent: () =>
    import('./formularios/ventas/ventas')
      .then(c => c.Ventas)
},

  {
    path: 'ventas',
    loadComponent: () =>
      import('./formularios/ventas/ventas')
        .then(c => c.Ventas)
  }

];