DROP DATABASE IF EXISTS bd_mototaxis;
CREATE DATABASE bd_mototaxis;
USE bd_mototaxis;

-- ==========================
-- ROLES === ✅
-- ==========================
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- IMPORTANTE: Insertar los roles por defecto
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'conductor','Conductor');

-- ==========================
-- USUARIOS === ✅
-- ==========================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id_usuario VARCHAR(36) PRIMARY KEY,
  correo VARCHAR(150) UNIQUE NOT NULL,
  clave VARCHAR(1000) NOT NULL,
  id_rol INT,
  nombre VARCHAR(255) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- !! IMPORTANTE: Insertar el Primer usuario Admin, password is "administrador"
INSERT INTO usuarios (id_usuario, correo, clave, id_rol, nombre, apellido_paterno, apellido_materno, telefono)
VALUES ('295b8bf4-08f3-415b-9cd7-968380efeae4', 'admin@admin.com', '$2a$12$zzNLviqR25IX7tIVBTYWV.TAH1nCgt06/0ilZ/eh5om7WZCf/F2S.', 1, 'Administrador', 'Por', 'Defecto', '999777555');

-- =====================================
-- RESETEO DE CLAVE O CONTRASEÑA === ✅
-- =====================================
CREATE TABLE reseteo_claves (
  id_reseteo_clave VARCHAR(36) PRIMARY KEY,
  id_usuario VARCHAR(36) REFERENCES usuarios(id_usuario),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_cambio VARCHAR(45),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================
-- MOTOS === ✅
-- ==========================
DROP TABLE IF EXISTS motos;
CREATE TABLE motos (
  id_moto VARCHAR(36) PRIMARY KEY,
  numero_moto INT UNIQUE NOT NULL,
  id_usuario VARCHAR(36) REFERENCES usuarios(id_usuario),
  placa VARCHAR(7) UNIQUE,
  estado ENUM('activo','inactivo','mantenimiento') DEFAULT 'activo',
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO motos (id_moto, numero_moto, estado)
WITH RECURSIVE nums AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 159
)
SELECT UUID(), n, 'inactivo'
FROM nums;

-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- =====================================================
-- CONDUCTORES === NO ESTAMOS USANDO ESTO
-- =====================================================
-- DROP TABLE IF EXISTS conductores;
-- CREATE TABLE conductores (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT NOT NULL UNIQUE,
--   dni VARCHAR(20) UNIQUE,
--   direccion VARCHAR(255),
--   licencia VARCHAR(100),
--   fecha_nacimiento DATE,
--   estado TINYINT(1) DEFAULT 1,
--   FOREIGN KEY (user_id) REFERENCES users(id)
-- ) ENGINE=InnoDB;

-- INSERT INTO users (username,email,password_hash,role_id,fullname,telefono)
-- VALUES ('joseriquez','josue@mail.com','123456',3,'Josué Riquez','987654321');

-- INSERT INTO conductores (user_id,dni,direccion,licencia,fecha_nacimiento)
-- SELECT id,'73456789','Calle Falsa 123','A-12345','1999-05-10'
-- FROM users WHERE username='joseriquez';

-- =============================
-- ASIGNACIÓN DE VEHÍCULOS === PARECE SER INNECESARIO
-- =============================
-- DROP TABLE IF EXISTS asignaciones_vehiculo;
-- CREATE TABLE asignaciones_vehiculo (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   conductor_id INT NOT NULL,
--   vehiculo_id INT NOT NULL,
--   fecha_inicio DATETIME NOT NULL,
--   fecha_fin DATETIME,
--   activo TINYINT(1) DEFAULT 1,
--   FOREIGN KEY (conductor_id) REFERENCES conductores(id),
--   FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
-- ) ENGINE=InnoDB;

-- INSERT INTO asignaciones_vehiculo (conductor_id, vehiculo_id, fecha_inicio, activo)
-- SELECT c.id, v.id, NOW(), 1
-- FROM conductores c, vehiculos v
-- WHERE c.dni='73456789' AND v.placa='MTX-001';

-- ==========================
-- PARADEROS === ✅
-- ==========================
DROP TABLE IF EXISTS paraderos;
CREATE TABLE paraderos (
  id_paradero VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(255),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  radio_metros INT DEFAULT 200,
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO paraderos (id_paradero, nombre, direccion, lat, lng) VALUES
('9e65cd60-eea8-4284-9fae-2ba044a18e32', 'Mormones', 'Flora Tristan 807', -12.1899026, -76.9249732),
('e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva', 'Los Incas 500, Villa María del Triunfo 15818', -12.1866497, -76.9247128),
('435c131e-c9d8-416e-a025-901c4efe5ca8', 'Lomas', 'A.h las Lomas de la Tablada', -12.1792270, -76.9269440),
('08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Comité 42', 'Puruchuco 1535', -12.179651, -76.924010),
('e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Comité 24', '1050 Flora Tristan', -12.1875950, -76.9184900);

-- =========================
-- TURNOS === ✅
-- =========================
DROP TABLE IF EXISTS turnos;
CREATE TABLE turnos (
  id_turno VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Turnos de Paraderos
INSERT INTO turnos (id_turno, nombre, hora_inicio, hora_fin) VALUES
-- Mormones (un solo turno todo el día)
('9ab72897-5d09-4313-8dac-846a3dc5103f', 'Turno Único Mormones', '06:00:00', '22:00:00'),

-- Curva (2 turnos)
('0b117481-5612-445b-9eac-3e95cf8a6801', 'Curva Turno Mañana', '06:30:00', '09:00:00'),
('7cde9a92-ec5e-459c-a9d5-94d4c6bfe63e', 'Curva Turno Noche', '22:00:00', '00:00:00'),

-- Lomas (un turno)
('86fd7410-80b1-40d6-8268-eb30dca97d04', 'Lomas Turno Mañana', '05:30:00', '09:00:00'),

-- Comité 42 (turnos por hora)
('3e49ada4-2ff9-4f74-b95f-8952da9f96ba', 'Turno 42 de 10:00-11:00', '10:00:00', '11:00:00'),
('4c42b8ce-3df5-4716-a24e-eaa7e04ac0ad', 'Turno 42 de 11:00-12:00', '11:00:00', '12:00:00'),
('7cee375b-3522-4022-930e-23d2e84bd7e2', 'Turno 42 de 12:00-13:00', '12:00:00', '13:00:00'),
('53c3b37e-61ee-40c7-9cfa-6b4cbcc451b9', 'Turno 42 de 13:00-14:00', '13:00:00', '14:00:00'),
('6f98b3ba-4572-49c0-886e-1f48ca260d6a', 'Turno 42 de 14:00-15:00', '14:00:00', '15:00:00'),
('e922ac7f-c940-4ad5-8f78-6ffdf38cd735', 'Turno 42 de 15:00-16:00', '15:00:00', '16:00:00'),
('89167e68-5882-44a7-be93-5989cfbc5f26', 'Turno 42 de 16:00-17:00', '16:00:00', '17:00:00'),
('ad62953d-5df9-4251-9cad-698c3b8d65c6', 'Turno 42 de 17:00-18:00', '17:00:00', '18:00:00'),

-- Comité 24 (turnos por hora)
('ada43248-a9b2-4f92-b7cb-7ecd9143befa', 'Turno 24 de 09:00-10:00', '09:00:00', '10:00:00'),
('37ccc887-91c8-4b29-9776-e1ab75884277', 'Turno 24 de 10:00-11:00', '10:00:00', '11:00:00'),
('7bd7429e-40ce-4bee-b9cb-965061671fad',  'Turno 24 de 11:00-12:00', '11:00:00', '12:00:00'),
('c9ecee70-be9d-4d8f-9074-28ff69b040d5', 'Turno 24 de 12:00-13:00', '12:00:00', '13:00:00'),
('6312098e-63f7-4b65-a8f1-978e3750706a', 'Turno 24 de 13:00-14:00', '13:00:00', '14:00:00'),
('51cd0eac-053c-47f4-876d-ae3d62f2478d', 'Turno 24 de 14:00-15:00', '14:00:00', '15:00:00'),
('a410f23d-a325-447e-bfec-497de12eb5d2', 'Turno 24 de 15:00-16:00', '15:00:00', '16:00:00'),
('051b43df-9e84-41a4-8917-c633815c615a', 'Turno 24 de 16:00-17:00', '16:00:00', '17:00:00'),
('b0c90c58-d26f-4064-bb05-37837f5d65f8', 'Turno 24 de 17:00-18:00', '17:00:00', '18:00:00');

-- =========================================
-- PROGRAMACIÓN === ✅
-- =========================================
DROP TABLE IF EXISTS programacion;
CREATE TABLE programacion (
  id_programacion BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_moto VARCHAR(36) NOT NULL,
  id_paradero VARCHAR(36) NOT NULL,
  id_turno VARCHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_moto) REFERENCES motos(id_moto),
  FOREIGN KEY (id_paradero) REFERENCES paraderos(id_paradero),
  FOREIGN KEY (id_turno) REFERENCES turnos(id_turno)
) ENGINE=InnoDB;

-- =======================================
-- ASISTENCIA === ESPERANDO IMPLEMENTACION ⏰
-- =======================================
DROP TABLE IF EXISTS asistencia;
CREATE TABLE asistencias (
  id_asistencia BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_programacion BIGINT NOT NULL,
  hora_entrada TIMESTAMP NULL DEFAULT NULL,
  lat_entrada DECIMAL(10,7) NULL,
  lng_entrada DECIMAL(10,7) NULL,
  precision_entrada_metros INT NULL,
  hora_salida TIMESTAMP NULL DEFAULT NULL,
  lat_salida DECIMAL(10,7) NULL,
  lng_salida DECIMAL(10,7) NULL,
  precision_salida_metros INT NULL,
  estado_entrada ENUM('pendiente', 'tardanza', 'falta', 'completado') DEFAULT 'pendiente',
  estado_salida ENUM('pendiente', 'falta', 'completado') DEFAULT 'pendiente',
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_programacion) REFERENCES programacion(id_programacion)
) ENGINE=InnoDB;

-- ==============================
-- PERMISOS === NECESITAMOS ESTO? (No es prioridad)
-- =============================
-- DROP TABLE IF EXISTS permisos;
-- CREATE TABLE permisos (
--   id BIGINT AUTO_INCREMENT PRIMARY KEY,
--   conductor_id INT NOT NULL,
--   tipo ENUM('permiso','tardanza','inasistencia'),
--   motivo TEXT,
--   fecha_inicio DATETIME,
--   fecha_fin DATETIME,
--   estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
--   evidencia VARCHAR(255),
--   FOREIGN KEY (conductor_id) REFERENCES conductores(id)
-- ) ENGINE=InnoDB;

-- ==========================
-- SANCIONES === NECESITAMOS ESTO? (No es prioridad)
-- ==========================
-- DROP TABLE IF EXISTS sanciones;
-- CREATE TABLE sanciones (
--   id BIGINT AUTO_INCREMENT PRIMARY KEY,
--   conductor_id INT NOT NULL,
--   programacion_id BIGINT,
--   tipo VARCHAR(100),
--   descripcion TEXT,
--   monto DECIMAL(10,2),
--   estado ENUM('pendiente','aplicada','anulada') DEFAULT 'pendiente',
--   FOREIGN KEY (conductor_id) REFERENCES conductores(id)
-- ) ENGINE=InnoDB;

-- SET FOREIGN_KEY_CHECKS = 1;
