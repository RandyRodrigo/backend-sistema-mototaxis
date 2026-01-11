import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Programacion } from './programacion';
import { Usuario } from './usuario';
import { Moto } from './moto';
import { Paradero } from './paradero';
import { Turno } from './turno';

@Entity('asistencias')
export class Asistencia {
    @PrimaryColumn({ name: 'id_asistencia', length: 36 })
    idAsistencia: string;

    @Column({ name: 'id_programacion', length: 36 })
    idProgramacion: string;

    @ManyToOne(() => Programacion)
    @JoinColumn({ name: 'id_programacion' })
    programacion: Programacion;

    @Column({ name: 'id_usuario', length: 36 })
    idUsuario: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ name: 'id_moto', length: 36 })
    idMoto: string;

    @ManyToOne(() => Moto)
    @JoinColumn({ name: 'id_moto' })
    moto: Moto;

    @Column({ name: 'id_paradero', length: 36 })
    idParadero: string;

    @ManyToOne(() => Paradero)
    @JoinColumn({ name: 'id_paradero' })
    paradero: Paradero;

    @Column({ name: 'id_turno', length: 36 })
    idTurno: string;

    @ManyToOne(() => Turno)
    @JoinColumn({ name: 'id_turno' })
    turno: Turno;

    @Column({ type: 'date' })
    fecha: string;

    // Marcado
    @Column({
        name: 'tipo_marcado',
        type: 'enum',
        enum: ['llegada', 'salida']
    })
    tipoMarcado: 'llegada' | 'salida';

    @Column({ name: 'hora_marcado', type: 'datetime' })
    horaMarcado: Date;

    @Column({ name: 'hora_esperada', type: 'time' })
    horaEsperada: string;

    // Geolocalización
    @Column({ name: 'latitud_marcado', type: 'decimal', precision: 10, scale: 8 })
    latitudMarcado: number;

    @Column({ name: 'longitud_marcado', type: 'decimal', precision: 11, scale: 8 })
    longitudMarcado: number;

    @Column({ name: 'distancia_metros', type: 'decimal', precision: 8, scale: 2, nullable: true })
    distanciaMetros: number;

    @Column({ name: 'dentro_radio', type: 'boolean', default: false })
    dentroRadio: boolean;

    // Estado
    @Column({
        name: 'estado_asistencia',
        type: 'enum',
        enum: ['asistio', 'tardanza', 'falta']
    })
    estadoAsistencia: 'asistio' | 'tardanza' | 'falta';

    @Column({ name: 'minutos_diferencia', type: 'int', default: 0 })
    minutosDiferencia: number;

    // Orden de llegada (para Comité 24)
    @Column({ name: 'orden_llegada', type: 'int', nullable: true })
    ordenLlegada: number;

    // Observaciones
    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ name: 'ip_marcado', length: 45, nullable: true })
    ipMarcado: string;

    @Column({ length: 255, nullable: true })
    dispositivo: string;

    // Auditoría
    @Column({ name: 'estado_auditoria' })
    estadoAuditoria: number;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion' })
    fechaModificacion: Date;
}
