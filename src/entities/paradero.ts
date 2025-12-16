import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('paraderos')
export class Paradero {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'nombre' })
    nombre: string;

    @Column({ name: 'direccion', nullable: true })
    direccion: string;

    @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lat: number;

    @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lng: number;

    @Column({ name: 'radio_metros', default: 200 })
    radioMetros: number;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
