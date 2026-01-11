import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Programacion } from "./programacion";

@Entity('asistencias')
export class Asistencia {

    @PrimaryGeneratedColumn({ name: 'id_asistencia' })
    idAsistencia: number;

    @Column({ name: 'id_programacion' })
    idProgramacion: number;

    @ManyToOne(() => Programacion)
    @JoinColumn({ name: 'id_programacion' })
    programacion: Programacion;

    @Column({ name: 'hora_entrada', type: 'timestamp', nullable: true })
    horaEntrada: Date;

    @Column({ name: 'lat_entrada', type: 'decimal', precision: 10, scale: 7, nullable: true })
    latEntrada: number;

    @Column({ name: 'lng_entrada', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lngEntrada: number;

    @Column({ name: 'precision_entrada_metros', type: 'int', nullable: true })
    precisionEntradaMetros: number;

    @Column({ name: 'hora_salida', type: 'timestamp', nullable: true })
    horaSalida: Date;

    @Column({ name: 'lat_salida', type: 'decimal', precision: 10, scale: 7, nullable: true })
    latSalida: number;

    @Column({ name: 'lng_salida', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lngSalida: number;

    @Column({ name: 'precision_salida_metros', type: 'int', nullable: true })
    precisionSalidaMetros: number;

    @Column({ name: 'estado_entrada', type: 'enum', enum: ['pendiente', 'tardanza', 'falta', 'completado'], default: 'pendiente' })
    estadoEntrada: string;

    @Column({ name: 'estado_salida', type: 'enum', enum: ['pendiente', 'falta', 'completado'], default: 'pendiente' })
    estadoSalida: string;

    @Column({ name: 'estado_auditoria', default: '1', length: 1 })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_modificacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    fechaModificacion: Date;
}
