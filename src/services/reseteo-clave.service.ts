import { AppDataSource } from "../config/appdatasource";
import { ReseteoClave } from "../entities/reseteo-clave";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";
import { generarUUID } from "../shared/util";

const repository = AppDataSource.getRepository(ReseteoClave);

export const insertarReseteoClave = async (data: Partial<ReseteoClave>): Promise<ReseteoClave> => {
    const nuevoReseteoClave = repository.create({
        idReseteoClave: generarUUID(),
        ...data
    });
    return await repository.save(nuevoReseteoClave);
};

export const validarTokenReseteoClave = async (idReseteoClave: string): Promise<ReseteoClave> => {
    return await repository.findOne({
        where: { idReseteoClave, estadoAuditoria: EstadoAuditoriaEnum.ACTIVO }
    });
};

export const obtenerReseteoClavePorId = async (idReseteoClave: string): Promise<ReseteoClave | null> => {
    return await repository.findOne({
        where: {
            idReseteoClave,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        },
        relations: ['usuario']
    });
};

export const obtenerReseteoClavePorUsuario = async (idUsuario: string): Promise<ReseteoClave | null> => {
    return await repository.findOne({
        where: {
            usuario: {
                idUsuario
            },
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        },
        relations: ['usuario']
    });
};

export const cambiarEstadoReseteoClave = async (idReseteoClave: string) => {
    return await repository.update(idReseteoClave, { estadoAuditoria: EstadoAuditoriaEnum.INACTIVO });
};