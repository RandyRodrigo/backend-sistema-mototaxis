import { AppDataSource } from "../config/appdatasource";
import { Usuario } from "../entities/usuario";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";

const repository = AppDataSource.getRepository(Usuario);

export const insertarUsuario = async (data: Partial<Usuario>): Promise<Usuario> => {
    return await repository.save(data);
};

export const obtenerUsuarioConClavePorCorreo = async (correo: string): Promise<Usuario | null> => {
    return await repository.findOne({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
            correo
        },
        select: {
            idUsuario: true,
            correo: true,
            clave: true
        }
    });
};

export const obtenerUsuario = async (idUsuario: string): Promise<Usuario> => {
    return await repository.findOne({
        where: {
            idUsuario,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });
};

export const listarUsuarios = async () => {
    return await repository.find({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
        }
    });
};
export const obtenerUsuarioPorCorreo = async (correo: string): Promise<Usuario | null> => {
    return await repository.findOne({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
            correo
        }
    });
};

export const obtenerUsuarioPorId = async (idUsuario: string): Promise<Usuario | null> => {
    return await repository.findOne({
        where: {
            idUsuario,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        }
    });
};

export const cambiarClaveUsuario = async (idUsuario: string, clave: string) => {
    await repository.update(idUsuario, { clave });
};