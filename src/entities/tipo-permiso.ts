import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('tipos_permisos')
export class TipoPermiso {

    @PrimaryColumn({ name: 'id_tipo_permiso' })
    idTipoPermiso: string;

    @Column({ name: 'nombre', unique: true })
    nombre: string;

    @Column({ name: 'descripcion', nullable: true })
    descripcion: string;

    @Column({ name: 'requiere_aprobacion', default: false })
    requiereAprobacion: boolean;

    @Column({ name: 'estado_auditoria', default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
