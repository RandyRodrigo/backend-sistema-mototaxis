import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Rol } from "./rol";

@Entity('usuarios')
export class Usuario {

    @PrimaryColumn({ name: 'id_usuario' })
    idUsuario: string;

    @Column({ name: 'correo' })
    correo: string;

    @Column({ name: 'clave', select: false })
    clave: string;

    @ManyToOne(() => Rol, (rol) => rol.usuarios)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @Column({ name: 'nombre' })
    nombre: string;

    @Column({ name: 'apellido_paterno' })
    apellidoPaterno: string;

    @Column({ name: 'apellido_materno' })
    apellidoMaterno: string;

    @Column({ name: 'telefono' })
    telefono: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}