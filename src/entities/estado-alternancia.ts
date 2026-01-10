import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('estado_alternancia')
export class EstadoAlternancia {

    @PrimaryColumn({ name: 'fecha', type: 'date' })
    fecha: string;

    @Column({
        name: 'tipo_dia',
        type: 'enum',
        enum: ['par', 'impar']
    })
    tipoDia: string;

    @Column({ name: 'posicion_curva_noche', type: 'enum', enum: ['primeros', 'ultimos'], default: 'ultimos' })
    posicionCurvaNoche: 'primeros' | 'ultimos';

    @Column({ name: 'estado_auditoria', default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
