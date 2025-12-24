import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('turnos')
export class Turno {

    @PrimaryGeneratedColumn({ name: 'id_turno' })
    idTurno: number;

    @Column({ name: 'nombre', length: 100 })
    nombre: string;

    @Column({ name: 'hora_inicio', type: 'time' })
    horaInicio: string;

    @Column({ name: 'hora_fin', type: 'time' })
    horaFin: string;

    @Column({ name: 'activo', default: 1 })
    activo: number;
}
