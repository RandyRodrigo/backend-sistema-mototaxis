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
  id_rol int,
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
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  radio_metros INT DEFAULT 100,
  capacidad_motos INT NOT NULL,
  es_subparadero BOOLEAN DEFAULT FALSE,
  id_paradero_principal VARCHAR(36) REFERENCES paraderos(id_paradero),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO paraderos (id_paradero, nombre, direccion, lat, lng, capacidad_motos, es_subparadero, id_paradero_principal) VALUES
('9e65cd60-eea8-4284-9fae-2ba044a18e32', 'Mormones', 'Flora Tristan 807', -12.1899026, -76.9249732, 25, FALSE, NULL),
('e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva', 'Los Incas 500, Villa María del Triunfo 15818', -12.1866497, -76.9247128, 7, FALSE, NULL),
('435c131e-c9d8-416e-a025-901c4efe5ca8', 'Lomas', 'A.h las Lomas de la Tablada', -12.1792270, -76.9269440, 20, FALSE, NULL),
('08b9d9c7-f7f3-4c87-ad3b-86e3fa5da3ab', 'Comité 42', 'Puruchuco 1535', -12.179651, -76.924010, 29, FALSE, NULL),
('e97279c8-eb79-40e1-954b-3a8a6dd5dc68', 'Comité 24', '1050 Flora Tristan', -12.1875950, -76.9184900, 25, TRUE, '9e65cd60-eea8-4284-9fae-2ba044a18e32');

-- ==========================
-- TURNOS PARADEROS
-- ==========================
DROP TABLE IF EXISTS turnos;
CREATE TABLE turnos (
    id_turno VARCHAR(36) PRIMARY KEY,
    id_paradero VARCHAR(36) NOT NULL,
    nombre VARCHAR(50),
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
INSERT INTO turnos (id_turno, id_paradero, nombre, hora_inicio, hora_fin, cantidad_motos, dias_semana) VALUES
-- Mormones (un solo turno todo el día)
('9ab72897-5d09-4313-8dac-846a3dc5103f', '9e65cd60-eea8-4284-9fae-2ba044a18e32', 'Turno Único Mormones', '06:00:00', '22:00:00', 25,'lunes,martes,miercoles,jueves,viernes,sabado,domingo'),

-- Curva (2 turnos)
('0b117481-5612-445b-9eac-3e95cf8a6801', 'e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva Turno Mañana', '06:30:00', '09:00:00', 7,'lunes,martes,miercoles,jueves,viernes,sabado'),
('7cde9a92-ec5e-459c-a9d5-94d4c6bfe63e', 'e12bf119-d1ee-443f-a3f4-fcee987cb15b', 'Curva Turno Noche', '22:00:00', '00:00:00', 7,'martes,miercoles,jueves,viernes,sabado,domingo'),

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

-- ==========================
-- PROGRAMACIÓN DE TURNOS
-- ==========================
DROP TABLE IF EXISTS programacion;
CREATE TABLE programacion (
  id_programacion VARCHAR(36) PRIMARY KEY,
  id_moto VARCHAR(36) NOT NULL,
  id_paradero VARCHAR(36) NOT NULL,
  id_turno VARCHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  orden_asignacion INT COMMENT 'Orden en que fue asignada la moto (1, 2, 3...)',
  es_compensacion BOOLEAN DEFAULT FALSE COMMENT 'Si fue agregada para compensar permisos',
  tipo_dia ENUM('par', 'impar') COMMENT 'Tipo de día cuando se generó (para turnos con alternancia)',
  generado_automaticamente BOOLEAN DEFAULT TRUE COMMENT 'Si fue generado automáticamente o manual',
  estado_auditoria CHAR(1) DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_moto) REFERENCES motos(id_moto),
  FOREIGN KEY (id_paradero) REFERENCES paraderos(id_paradero),
  FOREIGN KEY (id_turno) REFERENCES turnos(id_turno),
  -- Índices para mejorar rendimiento
  INDEX idx_fecha (fecha),
  INDEX idx_moto_fecha (id_moto, fecha),
  INDEX idx_paradero_fecha (id_paradero, fecha),
  INDEX idx_turno_fecha (id_turno, fecha)
);

-- ==========================
-- ALTERNANCIA DIA A DIA
-- ==========================
CREATE TABLE estado_alternancia (
  fecha DATE PRIMARY KEY,
  tipo_dia ENUM('par', 'impar') NOT NULL,
  posicion_curva_noche ENUM('primeros', 'ultimos') DEFAULT 'ultimos',
  estado_auditoria CHAR(1) DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ==========================
-- ORDEN LLEGADA COMITE 24
-- ==========================
CREATE TABLE orden_llegada_comite24 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  numero_moto INT NOT NULL,
  hora_marcado TIME NOT NULL,
  orden INT NOT NULL,
  id_turno_asignado VARCHAR(36),
  estado_auditoria CHAR(1) DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_turno_asignado) REFERENCES turnos(id_turno),
  INDEX idx_fecha_orden (fecha, orden)
);

-- ==========================
-- CONFIGURACION DE TURNOS
-- ==========================
CREATE TABLE configuracion_turnos (
  id_configuracion VARCHAR(36) PRIMARY KEY,
  id_turno VARCHAR(36) NOT NULL UNIQUE,
  usa_alternancia_par_impar BOOLEAN DEFAULT FALSE,
  tipo_asignacion ENUM('secuencial', 'orden_llegada') DEFAULT 'secuencial',
  prioridad_asignacion INT DEFAULT 1,
  estado_auditoria CHAR(1) DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_turno) REFERENCES turnos(id_turno)
);
-- Datos iniciales
INSERT INTO configuracion_turnos (id_configuracion, id_turno, usa_alternancia_par_impar, tipo_asignacion, prioridad_asignacion) VALUES
-- Mormones (prioridad 1, sin alternancia)
(UUID(), '9ab72897-5d09-4313-8dac-846a3dc5103f', FALSE, 'secuencial', 1),
-- Curva Mañana (prioridad 2, con alternancia)
(UUID(), '0b117481-5612-445b-9eac-3e95cf8a6801', TRUE, 'secuencial', 2),
-- Curva Noche (prioridad 3, con alternancia)
(UUID(), '7cde9a92-ec5e-459c-a9d5-94d4c6bfe63e', TRUE, 'secuencial', 3),
-- Lomas (prioridad 4, con alternancia)
(UUID(), '86fd7410-80b1-40d6-8268-eb30dca97d04', TRUE, 'secuencial', 4),
-- Comité 42 (prioridad 5-12, con alternancia)
(UUID(), '3e49ada4-2ff9-4f74-b95f-8952da9f96ba', TRUE, 'secuencial', 5),
(UUID(), '4c42b8ce-3df5-4716-a24e-eaa7e04ac0ad', TRUE, 'secuencial', 6),
(UUID(), '7cee375b-3522-4022-930e-23d2e84bd7e2', TRUE, 'secuencial', 7),
(UUID(), '53c3b37e-61ee-40c7-9cfa-6b4cbcc451b9', TRUE, 'secuencial', 8),
(UUID(), '6f98b3ba-4572-49c0-886e-1f48ca260d6a', TRUE, 'secuencial', 9),
(UUID(), 'e922ac7f-c940-4ad5-8f78-6ffdf38cd735', TRUE, 'secuencial', 10),
(UUID(), '89167e68-5882-44a7-be93-5989cfbc5f26', TRUE, 'secuencial', 11),
(UUID(), 'ad62953d-5df9-4251-9cad-698c3b8d65c6', TRUE, 'secuencial', 12),
-- Comité 24 (prioridad 13-21, orden de llegada)
(UUID(), 'ada43248-a9b2-4f92-b7cb-7ecd9143befa', FALSE, 'orden_llegada', 13),
(UUID(), '37ccc887-91c8-4b29-9776-e1ab75884277', FALSE, 'orden_llegada', 14),
(UUID(), '7bd7429e-40ce-4bee-b9cb-965061671fad', FALSE, 'orden_llegada', 15),
(UUID(), 'c9ecee70-be9d-4d8f-9074-28ff69b040d5', FALSE, 'orden_llegada', 16),
(UUID(), '6312098e-63f7-4b65-a8f1-978e3750706a', FALSE, 'orden_llegada', 17),
(UUID(), '51cd0eac-053c-47f4-876d-ae3d62f2478d', FALSE, 'orden_llegada', 18),
(UUID(), 'a410f23d-a325-447e-bfec-497de12eb5d2', FALSE, 'orden_llegada', 19),
(UUID(), '051b43df-9e84-41a4-8917-c633815c615a', FALSE, 'orden_llegada', 20),
(UUID(), 'b0c90c58-d26f-4064-bb05-37837f5d65f8', FALSE, 'orden_llegada', 21);

CREATE TABLE configuracion_asistencia (
  id_configuracion VARCHAR(36) PRIMARY KEY,
  tipo_marcado ENUM('llegada', 'salida') NOT NULL UNIQUE,
  tolerancia_minutos INT NOT NULL DEFAULT 15,
  descripcion VARCHAR(255),
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO configuracion_asistencia (id_configuracion, tipo_marcado, tolerancia_minutos, descripcion) VALUES
(UUID(), 'llegada', 15, 'Tolerancia para marcado de llegada'),
(UUID(), 'salida', 30, 'Tolerancia para marcado de salida');

CREATE TABLE asistencias (
  id_asistencia VARCHAR(36) PRIMARY KEY,
  id_programacion VARCHAR(36) NOT NULL,
  id_usuario VARCHAR(36) NOT NULL,
  id_moto VARCHAR(36) NOT NULL,
  id_paradero VARCHAR(36) NOT NULL,
  id_turno VARCHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  -- Marcado
  tipo_marcado ENUM('llegada', 'salida') NOT NULL,
  hora_marcado DATETIME NOT NULL,
  hora_esperada TIME NOT NULL,
  -- Geolocalización
  latitud_marcado DECIMAL(10, 8) NOT NULL,
  longitud_marcado DECIMAL(11, 8) NOT NULL,
  distancia_metros DECIMAL(8, 2),
  dentro_radio BOOLEAN DEFAULT FALSE,
  -- Estado
  estado_asistencia ENUM('asistio', 'tardanza', 'falta') NOT NULL,
  minutos_diferencia INT DEFAULT 0,
  -- Orden de llegada (para Comité 24)
  orden_llegada INT,
  -- Observaciones
  observaciones TEXT,
  ip_marcado VARCHAR(45),
  dispositivo VARCHAR(255),
  -- Auditoría
  estado_auditoria CHAR(1) NOT NULL DEFAULT '1',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_programacion) REFERENCES programacion(id_programacion) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_moto) REFERENCES motos(id_moto),
  FOREIGN KEY (id_paradero) REFERENCES paraderos(id_paradero),
  FOREIGN KEY (id_turno) REFERENCES turnos(id_turno),
  
  INDEX idx_fecha (fecha),
  INDEX idx_usuario_fecha (id_usuario, fecha),
  INDEX idx_paradero_fecha_tipo (id_paradero, fecha, tipo_marcado),
  INDEX idx_orden_llegada (fecha, orden_llegada),
  INDEX idx_estado (fecha, estado_asistencia),
  UNIQUE KEY unique_marcado (id_programacion, tipo_marcado)
);

    
-- ----------------------------------------------------------------------------------------------------------

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

-- Vista: Reporte de asistencias

CREATE OR REPLACE VIEW v_reporte_asistencias AS
SELECT 
    a.fecha,
    p.nombre AS paradero,
    t.nombre AS turno,
    CONCAT(u.nombre, ' ', u.apellido_paterno) AS conductor,
    m.numero_moto,
    a.tipo_marcado,
    a.hora_esperada,
    a.hora_marcado,
    a.estado_asistencia,
    a.minutos_diferencia,
    a.distancia_metros,
    a.dentro_radio,
    a.orden_llegada
FROM asistencias a
INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
INNER JOIN motos m ON a.id_moto = m.id_moto
INNER JOIN paraderos p ON a.id_paradero = p.id_paradero
INNER JOIN turnos t ON a.id_turno = t.id_turno;


-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

UPDATE motos 
SET estado = 'activo' 
WHERE numero_moto <= 159;


SELECT COUNT(*) as total_activas 
FROM motos 
WHERE estado = 'activo' AND estado_auditoria = 1;

SELECT * FROM configuracion_turnos;

UPDATE motos SET estado = 'activo' WHERE numero_moto <= 100;

-- ----------------------------------------------------------------------

-- ============================================
-- CONSULTAS PARA VISUALIZAR PROGRAMACIÓN
-- ============================================
-- 1. Vista General por Fecha (Similar a las imágenes)
-- ============================================
SELECT 
    p.nombre AS Paradero,
    t.nombre AS Turno,
    t.hora_inicio AS Inicio,
    t.hora_fin AS Fin,
    GROUP_CONCAT(m.numero_moto ORDER BY prog.orden_asignacion SEPARATOR ' - ') AS Numeros
FROM programacion prog
INNER JOIN motos m ON prog.id_moto = m.id_moto
INNER JOIN paraderos p ON prog.id_paradero = p.id_paradero
INNER JOIN turnos t ON prog.id_turno = t.id_turno
WHERE prog.fecha = '2026-01-17'
GROUP BY p.nombre, t.nombre, t.hora_inicio, t.hora_fin
ORDER BY 
    FIELD(p.nombre, 'Mormones', 'Lomas', 'Curva', 'Comité 42', 'Comité 24'),
    t.hora_inicio;
-- 2. Vista Detallada con Orden de Asignación
-- ============================================
SELECT 
    p.nombre AS Paradero,
    t.nombre AS Turno,
    CONCAT(t.hora_inicio, ' - ', t.hora_fin) AS Horario,
    m.numero_moto AS Numero,
    prog.orden_asignacion AS Orden,
    prog.tipo_dia AS TipoDia
FROM programacion prog
INNER JOIN motos m ON prog.id_moto = m.id_moto
INNER JOIN paraderos p ON prog.id_paradero = p.id_paradero
INNER JOIN turnos t ON prog.id_turno = t.id_turno
WHERE prog.fecha = '2026-01-14'
ORDER BY 
    FIELD(p.nombre, 'Mormones', 'Lomas', 'Curva', 'Comité 42', 'Comité 24'),
    t.hora_inicio,
    prog.orden_asignacion;
-- 3. Vista Compacta por Paradero (Formato Imagen)
-- ============================================
SELECT 
    p.nombre AS Paradero,
    COUNT(*) AS TotalMotos,
    GROUP_CONCAT(DISTINCT t.nombre ORDER BY t.hora_inicio SEPARATOR ' | ') AS Turnos,
    GROUP_CONCAT(m.numero_moto ORDER BY prog.orden_asignacion SEPARATOR ', ') AS Numeros
FROM programacion prog
INNER JOIN motos m ON prog.id_moto = m.id_moto
INNER JOIN paraderos p ON prog.id_paradero = p.id_paradero
INNER JOIN turnos t ON prog.id_turno = t.id_turno
WHERE prog.fecha = '2026-01-14'
GROUP BY p.nombre
ORDER BY FIELD(p.nombre, 'Mormones', 'Lomas', 'Curva', 'Comité 42', 'Comité 24');
-- 4. Verificación de Curva Noche (Alternancia)
-- ============================================
SELECT 
    prog.fecha AS Fecha,
    DAYNAME(prog.fecha) AS Dia,
    prog.tipo_dia AS TipoDia,
    ea.posicion_curva_noche AS Posicion,
    GROUP_CONCAT(m.numero_moto ORDER BY prog.orden_asignacion SEPARATOR ', ') AS NumerosCurvaNoche
FROM programacion prog
INNER JOIN motos m ON prog.id_moto = m.id_moto
INNER JOIN turnos t ON prog.id_turno = t.id_turno
LEFT JOIN estado_alternancia ea ON prog.fecha = ea.fecha
WHERE t.nombre = 'Curva Turno Noche'
  AND prog.fecha BETWEEN '2026-01-11' AND '2026-01-18'
GROUP BY prog.fecha, prog.tipo_dia, ea.posicion_curva_noche
ORDER BY prog.fecha;
-- 5. Resumen de Continuidad (Verificar secuencias)
-- ============================================
SELECT 
    prog.fecha AS Fecha,
    p.nombre AS Paradero,
    MIN(m.numeroMoto) AS PrimerNumero,
    MAX(m.numeroMoto) AS UltimoNumero,
    COUNT(*) AS TotalAsignaciones
FROM programacion prog
INNER JOIN motos m ON prog.idMoto = m.idMoto
INNER JOIN paraderos p ON prog.idParadero = p.idParadero
WHERE prog.fecha BETWEEN '2026-01-11' AND '2026-01-14'
  AND p.nombre IN ('Mormones', 'Lomas', 'Curva')
GROUP BY prog.fecha, p.nombre
ORDER BY prog.fecha, FIELD(p.nombre, 'Mormones', 'Lomas', 'Curva');
