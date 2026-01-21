import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("paraderos")
export class Paradero {
  @PrimaryColumn({ name: "id_paradero" })
  idParadero: string;

  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "direccion", nullable: true })
  direccion: string;

  @Column({
    name: "lat",
    type: "decimal",
    precision: 10,
    scale: 7,
    nullable: true,
  })
  lat: number;

  @Column({
    name: "lng",
    type: "decimal",
    precision: 10,
    scale: 7,
    nullable: true,
  })
  lng: number;

  @Column({ name: "radio_metros", default: 200 })
  radioMetros: number;

  @Column({ name: "capacidad_motos", default: 0 })
  capacidadMotos: number;

  @Column({ name: "es_subparadero", default: false })
  esSubparadero: boolean;

  @Column({ name: "estado_auditoria" })
  estadoAuditoria: number;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: "fecha_modificacion" })
  fechaModificacion: Date;
}

