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

export const listarUsuariosPorRol = async (idRol: number) => {
    return await repository.find({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO,
            id_rol: idRol
        }
    });
}

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
export const actualizarUsuario = async (idUsuario: string, data: Partial<Usuario>): Promise<Usuario | null> => {
    const usuario = await repository.findOne({
        where: { idUsuario, estadoAuditoria: EstadoAuditoriaEnum.ACTIVO }
    });

    if (!usuario) {
        return null;
    }

    if (data.correo && data.correo !== usuario.correo) {
        const usuarioExistente = await obtenerUsuarioPorCorreo(data.correo);
        if (usuarioExistente && usuarioExistente.idUsuario !== idUsuario) {
            throw new Error("El correo ya está registrado por otro usuario.");
        }
    }

    repository.merge(usuario, data);
    return await repository.save(usuario);
};
