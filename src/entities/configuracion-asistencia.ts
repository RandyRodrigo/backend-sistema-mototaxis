import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('configuracion_asistencia')
export class ConfiguracionAsistencia {
    @PrimaryColumn({ name: 'id_configuracion', length: 36 })
    idConfiguracion: string;

    @Column({
        name: 'tipo_marcado',
        type: 'enum',
        enum: ['llegada', 'salida'],
        unique: true
    })
    tipoMarcado: 'llegada' | 'salida';

    @Column({ name: 'tolerancia_minutos', type: 'int', default: 15 })
    toleranciaMinutos: number;

    @Column({ length: 255, nullable: true })
    descripcion: string;

    @Column({ name: 'estado_auditoria', length: 1, default: '1' })
    estadoAuditoria: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
