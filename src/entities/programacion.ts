import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Moto } from "./moto";
import { Paradero } from "./paradero";
import { Turno } from "./turno";

@Entity('programacion')
export class Programacion {

    @PrimaryColumn({ name: 'id_programacion' })
    idProgramacion: string;

    @ManyToOne(() => Moto)
    @JoinColumn({ name: 'id_moto' })
    moto: Moto;

    @ManyToOne(() => Paradero)
    @JoinColumn({ name: 'id_paradero' })
    paradero: Paradero;

    @ManyToOne(() => Turno)
    @JoinColumn({ name: 'id_turno' })
    turno: Turno;

    @Column({ name: 'fecha', type: 'date' })
    fecha: string;

    @Column({ name: 'orden_asignacion', nullable: true })
    ordenAsignacion: number;

    @Column({ name: 'es_compensacion', default: false })
    esCompensacion: boolean;

    @Column({
        name: 'tipo_dia',
        type: 'enum',
        enum: ['par', 'impar'],
        nullable: true
    })
    tipoDia: string;

    @Column({ name: 'generado_automaticamente', default: true })
    generadoAutomaticamente: boolean;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}

