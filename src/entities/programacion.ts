import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Moto } from "./moto";
import { Paradero } from "./paradero";
import { Turno } from "./turno";

@Entity('programacion')
export class Programacion {

    @PrimaryGeneratedColumn({ name: 'id_programacion' })
    idProgramacion: number;

    @ManyToOne(() => Moto)
    @JoinColumn({ name: 'id_moto' })
    moto: Moto;

    @ManyToOne(() => Paradero)
    @JoinColumn({ name: 'id_paradero' })
    paradero: Paradero;

    @ManyToOne(() => Turno)
    @JoinColumn({ name: 'turno_id' })
    turno: Turno;

    @Column({ name: 'fecha', type: 'date' })
    fecha: string;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
