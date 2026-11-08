
from flask import Blueprint, request, jsonify
from database import mysql
from datetime import datetime

ventas_bp = Blueprint('ventas', __name__)


# FUNCION GENERAL PARA OBTENER VENTAS
def obtener_ventas(consulta, parametros):
    cursor = None

    try:
        cursor = mysql.connection.cursor()

        cursor.execute(consulta, parametros)

        registros = cursor.fetchall()

        ventas = []

        for registro in registros:
            ventas.append({
                'nombre': str(registro[0]),
                'fecha': str(registro[1]),
                'total': float(registro[2])
            })

        total = sum(
            venta['total'] for venta in ventas
        )

        return jsonify({
            'ventas': ventas,
            'total': round(total, 2)
        }), 200

    except Exception as error:
        print('ERROR AL CONSULTAR VENTAS:', error)

        return jsonify({
            'mensaje': 'Error al consultar las ventas'
        }), 500

    finally:
        if cursor is not None:
            cursor.close()


# VENTAS POR FECHA
@ventas_bp.route('/ventas/dia', methods=['GET'])
def consultar_ventas_dia():

    dia = request.args.get('dia', '').strip()

    try:
        datetime.strptime(dia, '%Y-%m-%d')

    except ValueError:
        return jsonify({
            'mensaje': 'Fecha no válida'
        }), 400

    consulta = """
        SELECT
            c.nombre,
            p.fecha,
            p.total
        FROM pedidos p
        INNER JOIN clientes c
            ON p.idcliente = c.idcliente
        WHERE DATE(p.fecha) = %s
        ORDER BY p.fecha DESC
    """

    return obtener_ventas(consulta, (dia,))


# VENTAS POR DIA DE LA SEMANA
@ventas_bp.route('/ventas/semana', methods=['GET'])
def consultar_ventas_semana():

    dia = request.args.get('dia', '').strip().lower()

    dias = {
        'domingo': 1,
        'lunes': 2,
        'martes': 3,
        'miercoles': 4,
        'miércoles': 4,
        'jueves': 5,
        'viernes': 6,
        'sabado': 7,
        'sábado': 7
    }

    if dia not in dias:
        return jsonify({
            'mensaje': 'Día de la semana no válido'
        }), 400

    consulta = """
        SELECT
            c.nombre,
            p.fecha,
            p.total
        FROM pedidos p
        INNER JOIN clientes c
            ON p.idcliente = c.idcliente
        WHERE DAYOFWEEK(p.fecha) = %s
        ORDER BY p.fecha DESC
    """

    return obtener_ventas(
        consulta,
        (dias[dia],)
    )


# VENTAS POR MES
@ventas_bp.route('/ventas/mes', methods=['GET'])
def consultar_ventas_mes():

    try:
        mes = int(request.args.get('mes', ''))
        ano = int(request.args.get('ano', ''))

        if mes < 1 or mes > 12 or ano < 1:
            raise ValueError()

    except ValueError:
        return jsonify({
            'mensaje': 'Mes o año no válido'
        }), 400

    consulta = """
        SELECT
            c.nombre,
            p.fecha,
            p.total
        FROM pedidos p
        INNER JOIN clientes c
            ON p.idcliente = c.idcliente
        WHERE MONTH(p.fecha) = %s
          AND YEAR(p.fecha) = %s
        ORDER BY p.fecha DESC
    """

    return obtener_ventas(
        consulta,
        (mes, ano)
    )
