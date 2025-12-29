DROP DATABASE IF EXISTS bd_mototaxis;
CREATE DATABASE bd_mototaxis;
USE bd_mototaxis;

-- ==========================
-- ROLES
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
-- USUARIOS
-- ==========================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id_usuario VARCHAR(36) PRIMARY KEY,
  correo VARCHAR(150) UNIQUE NOT NULL,
  clave VARCHAR(1000) NOT NULL,
  id_rol VARCHAR(36),
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

-- ==========================
-- RESETEO DE CLAVE O CONTRASEÑA
-- ==========================
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
-- MOTOS
-- ==========================
DROP TABLE IF EXISTS motos;
CREATE TABLE motos (
  id_moto VARCHAR(36) PRIMARY KEY,
  numero_moto INT UNIQUE NOT NULL,
  id_usuario VARCHAR(36) REFERENCES usuarios(id_usuario),
  placa VARCHAR(7) UNIQUE,
  estado ENUM('activo','inactivo','mantenimiento') DEFAULT 'activo',/*Usado para: Validar programacion de turno*/
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',/*Usado para:  Listar y registrar un conductor o usuario, cuando este ingresa al sistema para escoger un numero de moto*/
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

-- ==========================
-- PARADEROS
-- ==========================
DROP TABLE IF EXISTS paraderos;
CREATE TABLE paraderos (
  id_paradero VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(255),
  latitud DECIMAL(10,7),
  longitud DECIMAL(10,7),
  radio_metros INT DEFAULT 100,
  capacidad_motos INT NOT NULL,
  es_subparadero BOOLEAN DEFAULT FALSE,
  id_paradero_principal VARCHAR(36) REFERENCES paraderos(id_paradero),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO paraderos (id_paradero, nombre, direccion, latitud, longitud, capacidad_motos, es_subparadero, id_paradero_principal) VALUES
('9e65cd60-eea8-4284-9fae-2ba044a18e32', 'Mormones', 'Flora Tristan 807', -12.1899026, -76.9249732, 25, FALSE, NULL),
('e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva', 'Los Incas 500, Villa María del Triunfo 15818', -12.1866497, -76.9247128, 7, FALSE, NULL),
('435c131e-c9d8-416e-a025-901c4efe5ca8', 'Lomas', 'A.h las Lomas de la Tablada', -12.1792270, -76.9269440, 20, FALSE, NULL),
('08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Comité 42', 'Puruchuco 1535', -12.179651, -76.924010, 29, FALSE, NULL),
('e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Comité 24', '1050 Flora Tristan', -12.1875950, -76.9184900, 25, TRUE, '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab');

-- ==========================
-- TURNOS PARADEROS
-- ==========================
DROP TABLE IF EXISTS turnos_paraderos;
CREATE TABLE turnos_paradero (
    id_turno VARCHAR(36) PRIMARY KEY,
    id_paradero VARCHAR(36) NOT NULL,
    nombre_turno VARCHAR(50),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cantidad_motos INT NOT NULL,
    dias_semana SET('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
    estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paradero) REFERENCES paraderos(id_paradero)
);

-- Turnos de Paraderos
INSERT INTO turnos_paradero (id_turno, id_paradero, nombre_turno, hora_inicio, hora_fin, cantidad_motos, dias_semana) VALUES
-- Mormones (un solo turno todo el día)
('9ab72897-5d09-4313-8dac-846a3dc5103f', '9e65cd60-eea8-4284-9fae-2ba044a18e32', 'Turno Único Mormones', '06:00:00', '22:00:00', 25,'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),

-- Curva (2 turnos)
('0b117481-5612-445b-9eac-3e95cf8a6801', 'e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva Turno Mañana', '06:30:00', '09:00:00', 7,'lunes,martes,miercoles,jueves,viernes,sabado'),
('7cde9a92-ec5e-459c-a9d5-94d4c6bfe63e', 'e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva Turno Noche', '22:00:00', '00:00:00', 7,'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),

-- Lomas (un turno)
('86fd7410-80b1-40d6-8268-eb30dca97d04', '435c131e-c9d8-416e-a025-901c4efe5ca8', 'Lomas Turno Mañana', '05:30:00', '09:00:00', 20, 'lunes,martes,miercoles,jueves,viernes,sabado'),

-- Comité 42 (turnos por hora)
('3e49ada4-2ff9-4f74-b95f-8952da9f96ba', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 10:00-11:00', '10:00:00', '11:00:00', 4, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('4c42b8ce-3df5-4716-a24e-eaa7e04ac0ad', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 11:00-12:00', '11:00:00', '12:00:00', 4, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('7cee375b-3522-4022-930e-23d2e84bd7e2', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 12:00-13:00', '12:00:00', '13:00:00', 4, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('53c3b37e-61ee-40c7-9cfa-6b4cbcc451b9', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 13:00-14:00', '13:00:00', '14:00:00', 4, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('6f98b3ba-4572-49c0-886e-1f48ca260d6a', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 14:00-15:00', '14:00:00', '15:00:00', 4, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('e922ac7f-c940-4ad5-8f78-6ffdf38cd735', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 15:00-16:00', '15:00:00', '16:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('89167e68-5882-44a7-be93-5989cfbc5f26', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 16:00-17:00', '16:00:00', '17:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado'),
('ad62953d-5df9-4251-9cad-698c3b8d65c6', '08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Turno 42 de 17:00-18:00', '17:00:00', '18:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado'),

-- Comité 24 (turnos por hora)
('ada43248-a9b2-4f92-b7cb-7ecd9143befa', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 09:00-10:00', '09:00:00', '10:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('37ccc887-91c8-4b29-9776-e1ab75884277', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 10:00-11:00', '10:00:00', '11:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('7bd7429e-40ce-4bee-b9cb-965061671fad', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 11:00-12:00', '11:00:00', '12:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('c9ecee70-be9d-4d8f-9074-28ff69b040d5', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 12:00-13:00', '12:00:00', '13:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('6312098e-63f7-4b65-a8f1-978e3750706a', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 13:00-14:00', '13:00:00', '14:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('51cd0eac-053c-47f4-876d-ae3d62f2478d', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 14:00-15:00', '14:00:00', '15:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('a410f23d-a325-447e-bfec-497de12eb5d2', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 15:00-16:00', '15:00:00', '16:00:00', 3, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('051b43df-9e84-41a4-8917-c633815c615a', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 16:00-17:00', '16:00:00', '17:00:00', 2, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),
('b0c90c58-d26f-4064-bb05-37837f5d65f8', 'e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Turno 24 de 17:00-18:00', '17:00:00', '18:00:00', 2, 'lunes,martes,miercoles,jueves,viernes,sabado,domingo');

-- ==========================
-- TIPOS DE PERMISO
-- ==========================
DROP TABLE IF EXISTS tipos_permisos;
CREATE TABLE tipos_permisos (
    id_tipo_permiso VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO tipos_permisos (id_tipo_permiso, nombre, descripcion, requiere_aprobacion) VALUES
(UUID(), 'Falla Mecánica', 'Permiso por problemas mecánicos de la moto', FALSE),
(UUID(), 'Sin Chofer', 'No cuenta con conductor disponible', FALSE),
(UUID(), 'Emergencia Personal', 'Emergencia del propietario o conductor', FALSE),
(UUID(), 'Otro', 'Otros motivos justificados', FALSE);


-- ==========================
-- SOLICITUDES DE PERMISO
-- ==========================
DROP TABLE IF EXISTS solicitudes_permiso;
CREATE TABLE solicitudes_permisos (
    id_solicitud VARCHAR(36) PRIMARY KEY,
    id_moto VARCHAR(36) NOT NULL,
    id_tipo_permiso VARCHAR(36) NOT NULL,
    id_solicitante VARCHAR(36) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT NOT NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'aprobado',
    id_aprobador VARCHAR(36),
    fecha_respuesta TIMESTAMP NULL,
    comentario_respuesta TEXT,
    estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_moto) REFERENCES motos(id_moto),
    FOREIGN KEY (id_tipo_permiso) REFERENCES tipos_permisos(id_tipo_permiso),
    FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_aprobador) REFERENCES usuarios(id_usuario)
);



-- Vista: Motos Disponibles para Programar
CREATE OR REPLACE VIEW v_motos_disponibles AS
SELECT 
    m.id_moto,
    m.numero_moto,
    m.placa,
    m.estado,
    CONCAT(u.nombre, ' ', u.apellido_paterno) AS usuario_conductor,
    u.telefono AS telefono_usuario
FROM motos m
LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
WHERE m.estado = 'activo' 
AND m.estado_auditoria = '1'
AND m.id_moto NOT IN (
    SELECT sp.id_moto 
    FROM solicitudes_permisos sp 
    WHERE sp.estado = 'aprobado' 
    AND CURDATE() BETWEEN sp.fecha_inicio AND sp.fecha_fin
)
ORDER BY m.numero_moto;

-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
