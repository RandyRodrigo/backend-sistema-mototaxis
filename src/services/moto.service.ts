import { AppDataSource } from "../config/appdatasource";
import { Moto } from "../entities/moto";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";
import { EstadoMotoEnum } from "../enums/estado-moto.enums";
import { generarUUID } from "../shared/util";
import { IsNull } from "typeorm";

const repository = AppDataSource.getRepository(Moto);

export const insertarMoto = async (data: Partial<Moto>): Promise<Moto> => {
    const nuevaMoto = repository.create({
        idMoto: generarUUID(),
        estado: EstadoMotoEnum.INACTIVO,
        ...data
    });
    return await repository.save(nuevaMoto);
};

export const obtenerMotoPorNumeroMoto = async (numeroMoto: number): Promise<Moto> => {
    return await repository.findOne({
        where: {
            numeroMoto,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });
};

export const obtenerMotoPorId = async (idMoto: string): Promise<Moto> => {
    return await repository.findOne({
        where: {
            idMoto,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });
};

export const listarMotos = async () => {
    return await repository.find({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
        }
    });
};

export const listarMotosDisponibles = async (): Promise<Moto[]> => {
    return await repository.find({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
            usuario: IsNull() // Solo motos sin usuario asignado
        }
    });
};

export const asignarUsuarioAMoto = async (numeroMoto: number, idUsuario: string): Promise<Moto> => {
    // Buscar la moto por número
    const moto = await repository.findOne({
        where: {
            numeroMoto,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });

    if (!moto) {
        throw new Error('Moto no encontrada');
    }

    // Actualizar la moto con el usuario
    moto.usuario = { idUsuario } as any;
    moto.estado = EstadoMotoEnum.ACTIVO;

    return await repository.save(moto);
};

export const obtenerMotoPorIdUsuario = async (idUsuario: string): Promise<Moto | null> => {
    return await repository.findOne({
        where: {
            usuario: { idUsuario },
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });
};