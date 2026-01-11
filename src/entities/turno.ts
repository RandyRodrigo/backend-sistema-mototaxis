import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('turnos')
export class Turno {

    @PrimaryColumn({ name: 'id_turno' })
    idTurno: string;

    @Column({ name: 'id_paradero' })
    idParadero: string;

    @Column({ name: 'nombre', length: 50 })
    nombre: string;

    @Column({ name: 'hora_inicio', type: 'time' })
    horaInicio: string;

    @Column({ name: 'hora_fin', type: 'time' })
    horaFin: string;

    @Column({ name: 'cantidad_motos' })
    cantidadMotos: number;

    @Column({ name: 'dias_semana' })
    diasSemana: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;
    
    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;
    
    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}

/*-- ==========================
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
); */