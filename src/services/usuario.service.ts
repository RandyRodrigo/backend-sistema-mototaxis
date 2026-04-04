import { AppDataSource } from "../config/appdatasource";
import { Usuario } from "../entities/usuario";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";
import { v4 as uuidv4 } from 'uuid';
import { encriptarClave } from '../shared/util';
import { Moto } from "../entities/moto";
import { Asistencia } from "../entities/asistencia";
const repository = AppDataSource.getRepository(Usuario);
const repoMoto = AppDataSource.getRepository(Moto);
const repoAsistencia = AppDataSource.getRepository(Asistencia);


export const insertarUsuario = async (data: Partial<Usuario>): Promise<Usuario> => {
    const claveEncriptada = await encriptarClave(data.clave);
    const nuevoUsuario = repository.create({
        ...data,
        idUsuario: uuidv4(),
        clave: claveEncriptada,
        id_rol: 2
    });
    return await repository.save(nuevoUsuario);
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

export const eliminarUsuario = async (idUsuario: string, motoAsignada: Moto | null) => {
    const usuario = await obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
        return null;
    }
    
    // Desasignar moto antes de eliminar al usuario
    if (motoAsignada) {
        await repoMoto.update(motoAsignada.idMoto, { usuario: null });
    }
    
    // Eliminar asistencias asociadas al usuario
    await repoAsistencia.delete({
        usuario: {
            idUsuario: idUsuario
        }
    });

       // Finalmente eliminar usuario
    return await repository.delete(idUsuario);
}

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
