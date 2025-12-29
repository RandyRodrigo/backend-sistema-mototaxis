import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('turnos')
export class Turno {

    @PrimaryColumn({ name: 'id_turno' })
    idTurno: string;

    @Column({ name: 'nombre', length: 100 })
    nombre: string;

    @Column({ name: 'hora_inicio', type: 'time' })
    horaInicio: string;

    @Column({ name: 'hora_fin', type: 'time' })
    horaFin: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;
    
    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;
    
    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
