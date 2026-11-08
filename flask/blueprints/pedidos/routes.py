from flask import Blueprint, request, jsonify
from database import mysql

pedidos_bp = Blueprint('pedidos', __name__)

@pedidos_bp.route('/pedidos', methods=['POST'])
def registrar_pedido():

    cursor = None

    try:
        datos = request.get_json()

        if not datos:
            return jsonify({
                'exito': False,
                'mensaje': 'No se recibieron datos'
            }), 400

        print("DATOS RECIBIDOS:", datos)

        cliente = datos['cliente']

        cursor = mysql.connection.cursor()

        # Registrar cliente
        cursor.execute("""
            INSERT INTO clientes (nombre, direccion, telefono)
            VALUES (%s, %s, %s)
        """, (
            cliente['nombre'],
            cliente['direccion'],
            cliente['telefono']
        ))

        idcliente = cursor.lastrowid

        # Registrar pedido
        cursor.execute("""
            INSERT INTO pedidos (idcliente, fecha, total)
            VALUES (%s, %s, %s)
        """, (
            idcliente,
            datos['fecha'],
            datos['total']
        ))

        idpedido = cursor.lastrowid

        # Registrar pizzas
        for pizza in datos['pizzas']:

            ingredientes = pizza['ingredientes']

            if isinstance(ingredientes, list):
                ingredientes = ', '.join(ingredientes)

            cursor.execute("""
                INSERT INTO detalle_pedido
                (idpedido, tamano, ingredientes, numero_pizzas, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                idpedido,
                pizza['tamano'],
                ingredientes,
                pizza['numero_pizzas'],
                pizza['subtotal']
            ))

        mysql.connection.commit()

        return jsonify({
            'exito': True,
            'mensaje': 'Pedido registrado correctamente',
            'idpedido': idpedido
        }), 201

    except Exception as e:

        print("ERROR AL REGISTRAR PEDIDO:", str(e))

        import traceback
        traceback.print_exc()

        try:
            mysql.connection.rollback()
        except Exception:
            pass

        return jsonify({
            'exito': False,
            'mensaje': str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

@pedidos_bp.route('/pedidos/<int:idpedido>', methods=['GET'])
def consultar_pedido(idpedido):
    cursor = mysql.connection.cursor()

    cursor.execute("""
        SELECT c.nombre, p.fecha, p.total,
               d.tamano, d.ingredientes,
               d.numero_pizzas, d.subtotal
        FROM pedidos p
        INNER JOIN clientes c ON p.idcliente = c.idcliente
        INNER JOIN detalle_pedido d ON p.idpedido = d.idpedido
        WHERE p.idpedido = %s
    """, (idpedido,))

    datos = cursor.fetchall()
    cursor.close()

    if not datos:
        return jsonify({'mensaje': 'Pedido no encontrado'}), 404

    return jsonify(datos)

    
@pedidos_bp.route('/pedidos/todos', methods=['GET'])
def listar_pedidos():
    cursor = None

    try:
        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT
                p.idpedido,
                c.nombre,
                c.direccion,
                c.telefono,
                p.fecha,
                p.total,
                d.tamano,
                d.ingredientes,
                d.numero_pizzas,
                d.subtotal
            FROM pedidos p
            INNER JOIN clientes c
                ON p.idcliente = c.idcliente
            LEFT JOIN detalle_pedido d
                ON p.idpedido = d.idpedido
            ORDER BY p.idpedido DESC, d.iddetalle ASC
        """)

        filas = cursor.fetchall()

        pedidos = {}

        for fila in filas:
            idpedido = fila[0]

            if idpedido not in pedidos:
                pedidos[idpedido] = {
                    'idpedido': idpedido,
                    'nombre': fila[1],
                    'direccion': fila[2],
                    'telefono': fila[3],
                    'fecha': str(fila[4]),
                    'total': float(fila[5]),
                    'pizzas': []
                }

            if fila[6] is not None:
                pedidos[idpedido]['pizzas'].append({
                    'tamano': fila[6],
                    'ingredientes': fila[7],
                    'numero_pizzas': fila[8],
                    'subtotal': float(fila[9])
                })

        return jsonify(list(pedidos.values()))

    except Exception as e:
        return jsonify({
            'mensaje': str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
