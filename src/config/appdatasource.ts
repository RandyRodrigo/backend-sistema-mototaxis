import { DataSource } from "typeorm";
import { DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_LOGGING } from "../shared/constants";
import { Rol } from "../entities/rol";
import { Usuario } from "../entities/usuario";
import { ReseteoClave } from "../entities/reseteo-clave";
import { Moto } from "../entities/moto";
import { Paradero } from "../entities/paradero";
import { Asistencia } from "../entities/asistencia";
import { Turno } from "../entities/turno";
import { Programacion } from "../entities/programacion";


export const AppDataSource = new DataSource({
    type: DB_TYPE as any,
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    logging: DB_LOGGING === 'true',
    entities: [Rol, Usuario, ReseteoClave, Moto, Paradero, Asistencia, Turno, Programacion],
    synchronize: false
});