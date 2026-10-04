import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)

# Configuración CORS completa para permitir comunicación desde cualquier origen en la API
CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Función para establecer conexión con MySQL en Clever Cloud
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "blf69bpiee0wmllxt25j-mysql.services.clever-cloud.com"),
        port=int(os.environ.get("DB_PORT", 3306)),  # <--- Asegurar int() aquí
        user=os.environ.get("DB_USER", "usqqkds0lpqp0bby"),
        password=os.environ.get("DB_PASSWORD", "zGbyr7tdrYpT0ZYZwsVl"), 
        database=os.environ.get("DB_NAME", "blf69bpiee0wmllxt25j")
    )

# MIGRACIÓN AUTOMÁTICA: Crea las tablas requeridas si no existen
def inicializar_base_de_datos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Tabla Estudiantes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS estudiantes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cedula VARCHAR(20) UNIQUE NOT NULL,
                nombres VARCHAR(100) NOT NULL,
                edad INT NOT NULL,
                correo VARCHAR(100) NOT NULL,
                telefono VARCHAR(20),
                anio_asignado INT DEFAULT NULL,
                seccion VARCHAR(5) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        # 2. Tabla Notas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cedula_estudiante VARCHAR(20) NOT NULL,
                materia VARCHAR(100) NOT NULL,
                nota FLOAT NOT NULL,
                FOREIGN KEY (cedula_estudiante) REFERENCES estudiantes(cedula) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("--> Base de datos inicializada correctamente en Clever Cloud MySQL.")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")

inicializar_base_de_datos()

# 0. RUTA BASE: Verificación de estado
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "Servidor Activo",
        "mensaje": "Backend de Control de Evaluación conectado a Clever Cloud MySQL"
    }), 200

# 1. RUTA: Obtener la lista de todos los estudiantes
@app.route('/api/estudiantes', methods=['GET'])
def obtener_estudiantes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM estudiantes")
        estudiantes = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(estudiantes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. RUTA: Registrar un nuevo estudiante
@app.route('/api/estudiantes', methods=['POST'])
def guardar_estudiante():
    datos = request.json
    
    if not datos.get('cedula') or not datos.get('nombres') or not datos.get('edad') or not datos.get('correo'):
        return jsonify({"error": "Faltan campos obligatorios por rellenar"}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM estudiantes WHERE cedula = %s", (datos['cedula'],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "La cédula ingresada ya se encuentra registrada"}), 400

        query = """INSERT INTO estudiantes (cedula, nombres, edad, correo, telefono, anio_asignado, seccion) 
                   VALUES (%s, %s, %s, %s, %s, NULL, NULL)"""
        valores = (datos['cedula'], datos['nombres'], int(datos['edad']), datos['correo'], datos.get('telefono'))
        
        cursor.execute(query, valores)
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({"message": "Estudiante registrado con éxito"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. RUTA: Asignación masiva por Año y Sección
@app.route('/api/estudiantes/asignar-masivo', methods=['PUT', 'OPTIONS'])
def asignar_masivo():
    if request.method == 'OPTIONS':
        return '', 200

    datos = request.json
    
    if not datos.get('year') or not datos.get('seccion') or not datos.get('cedulas'):
        return jsonify({"error": "Faltan datos obligatorios para realizar la asignación"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "UPDATE estudiantes SET anio_asignado = %s, seccion = %s WHERE cedula = %s"
        parametros = [(int(datos['year']), str(datos['seccion']).upper(), str(c)) for c in datos['cedulas']]
        
        cursor.executemany(query, parametros)
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({"message": f"{len(datos['cedulas'])} estudiantes asignados a {datos['year']}° Año '{datos['seccion']}' con éxito."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. RUTA: Registrar nota
@app.route('/api/notas', methods=['POST'])
def guardar_nota():
    datos = request.json
    
    if not datos.get('cedula') or not datos.get('materia') or not datos.get('nota'):
        return jsonify({"error": "Faltan datos obligatorios para registrar la nota"}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "INSERT INTO notas (cedula_estudiante, materia, nota) VALUES (%s, %s, %s)"
        valores = (datos['cedula'], datos['materia'], float(datos['nota']))
        
        cursor.execute(query, valores)
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({"message": "Nota registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. RUTA: Obtener notas por cédula
@app.route('/api/notas/<cedula>', methods=['GET'])
def obtener_notas_estudiante(cedula):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT materia, nota FROM notas WHERE cedula_estudiante = %s"
        cursor.execute(query, (cedula,))
        notas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(notas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)