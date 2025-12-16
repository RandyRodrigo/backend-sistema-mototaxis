import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('asistencias')
export class Asistencia {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'numero_moto' })
    numeroMoto: number;

    @Column({ name: 'direccion_paradero', nullable: true })
    direccionParadero: string;

    @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lat: number;

    @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lng: number;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;
}
