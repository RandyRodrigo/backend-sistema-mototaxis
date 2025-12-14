export enum EstadoMotoEnum {
    ACTIVO = 'activo',
    INACTIVO = 'inactivo',
    MANTENIMIENTO = 'mantenimiento'
}

/*-- ==========================
-- MOTOS
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
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);*/