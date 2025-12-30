import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('paraderos')
export class Paradero {

    @PrimaryColumn({ name: 'id_paradero' })
    idParadero: string;

    @Column({ name: 'nombre' })
    nombre: string;

    @Column({ name: 'direccion', nullable: true })
    direccion: string;

    @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lat: number;

    @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lng: number;

    @Column({ name: 'radio_metros', default: 200 })
    radioMetros: number;

    @Column({ name: 'capacidad_motos' })
    capacidadMotos: number;

    @Column({ name: 'es_subparadero' })
    esSubparadero: boolean;

    @Column({ name: 'id_paradero_principal', nullable: true })
    idParaderoPrincipal: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;
    
    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;
    
    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}


/*-- ==========================
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
); */