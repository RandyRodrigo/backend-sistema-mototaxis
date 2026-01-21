import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Paradero } from "./paradero";

@Entity('turnos')
export class Turno {

    @PrimaryColumn({ name: 'id_turno' })
    idTurno: string;

    @ManyToOne(() => Paradero)
    @JoinColumn({ name: 'id_paradero' })
    paradero: Paradero;

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
