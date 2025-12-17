import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Usuario } from "./usuario";

@Entity('roles')
export class Rol {
    @PrimaryColumn({ name: 'id_rol' })
    idRol: number;

    @Column({ name: 'nombre' })
    nombre: string;

    @Column({ name: 'descripcion' })
    descripcion: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;

    @OneToMany(() => Usuario, (usuario) => usuario.rol)
    usuarios: Usuario[];
}