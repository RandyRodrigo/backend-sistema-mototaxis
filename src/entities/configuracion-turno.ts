import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Turno } from "./turno";

@Entity('configuracion_turnos')
export class ConfiguracionTurno {

    @PrimaryColumn({ name: 'id_configuracion' })
    idConfiguracion: string;

    @OneToOne(() => Turno)
    @JoinColumn({ name: 'id_turno' })
    turno: Turno;

    @Column({ name: 'usa_alternancia_par_impar', default: false })
    usaAlternanciaParImpar: boolean;

    @Column({
        name: 'tipo_asignacion',
        type: 'enum',
        enum: ['secuencial', 'orden_llegada'],
        default: 'secuencial'
    })
    tipoAsignacion: string;

    @Column({ name: 'prioridad_asignacion', default: 1 })
    prioridadAsignacion: number;

    @Column({ name: 'estado_auditoria', default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
