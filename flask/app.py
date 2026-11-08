
from flask import Flask
from flask_cors import CORS

from database import mysql
from config import config

from blueprints.pedidos.routes import pedidos_bp
from blueprints.ventas.routes import ventas_bp


app = Flask(__name__)

# CONFIGURACION
app.config.from_mapping(config["development"])

# MYSQL
mysql.init_app(app)

# PERMITIR CONEXION DESDE ANGULAR
CORS(app, origins=["http://localhost:4200"])

# REGISTRAR BLUEPRINTS
app.register_blueprint(pedidos_bp)
app.register_blueprint(ventas_bp)


@app.route('/')
def inicio():
    return "Servidor de Pizzeria funcionando"


if __name__ == '__main__':
    app.run(debug=True, port=5000)
