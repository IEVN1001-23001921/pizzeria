export interface IPedido {
  cliente: {
    nombre: string;
    direccion: string;
    telefono: string;
  };

  fecha: string;
  total: number;

  pizzas: {
    tamano: string;
    ingredientes: string;
    numero_pizzas: number;
    subtotal: number;
  }[];
}