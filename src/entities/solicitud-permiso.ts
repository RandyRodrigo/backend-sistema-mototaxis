import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Moto } from "./moto";
import { Usuario } from "./usuario";
import { TipoPermiso } from "./tipo-permiso";

@Entity('solicitudes_permisos')
export class SolicitudPermiso {

    @PrimaryColumn({ name: 'id_solicitud' })
    idSolicitud: string;

    @ManyToOne(() => Moto)
    @JoinColumn({ name: 'id_moto' })
    moto: Moto;

    @ManyToOne(() => TipoPermiso)
    @JoinColumn({ name: 'id_tipo_permiso' })
    tipoPermiso: TipoPermiso;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'id_solicitante' })
    solicitante: Usuario;

    @Column({ name: 'fecha_inicio', type: 'date' })
    fechaInicio: string;

    @Column({ name: 'fecha_fin', type: 'date' })
    fechaFin: string;

    @Column({ name: 'motivo', type: 'text' })
    motivo: string;

    @Column({
        name: 'estado',
        type: 'enum',
        enum: ['pendiente', 'aprobado', 'rechazado'],
        default: 'aprobado'
    })
    estado: string;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'id_aprobador' })
    aprobador: Usuario;

    @Column({ name: 'fecha_respuesta', nullable: true })
    fechaRespuesta: Date;

    @Column({ name: 'comentario_respuesta', type: 'text', nullable: true })
    comentarioRespuesta: string;

    @Column({ name: 'estado_auditoria', default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
