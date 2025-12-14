import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Usuario } from "./usuario";

@Entity('motos')
export class Moto {

    @PrimaryColumn({ name: 'id_moto' })
    idMoto: string;

    @Column({ name: 'numero_moto' })
    numeroMoto: number;

    @OneToOne(() => Usuario, (usuario) => usuario.moto)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ name: 'placa' })
    placa: string;

    @Column({ name: 'estado' })
    estado: string;

    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}


/*Table: motos
Columns:
id_moto varchar(36) PK 
numero_moto int 
id_usuario varchar(36) 
placa varchar(7) 
estado enum('activo','inactivo','mantenimiento') 
estado_auditoria char(1) 
fecha_creacion timestamp 
fecha_modificacion timestamp*/