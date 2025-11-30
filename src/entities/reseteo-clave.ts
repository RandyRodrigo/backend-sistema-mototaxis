import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "./usuario";

@Entity('reseteo_claves')
export class ReseteoClave {
    @PrimaryColumn({ name: 'id_reseteo_clave' })
    idReseteoClave: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @CreateDateColumn({ name: 'fecha_cambio' })
    fechaCambio: Date;

    @Column({ name: 'ip_cambio' })
    ipCambio: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}