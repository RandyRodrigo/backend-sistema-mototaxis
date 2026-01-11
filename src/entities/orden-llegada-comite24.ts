import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Turno } from "./turno";

@Entity('orden_llegada_comite24')
export class OrdenLlegadaComite24 {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'fecha', type: 'date' })
    fecha: string;

    @Column({ name: 'numero_moto' })
    numeroMoto: number;

    @Column({ name: 'hora_marcado', type: 'time' })
    horaMarcado: string;

    @Column({ name: 'orden' })
    orden: number;

    @ManyToOne(() => Turno, { nullable: true })
    @JoinColumn({ name: 'id_turno_asignado' })
    turnoAsignado: Turno;

    @Column({ name: 'estado_auditoria', default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
