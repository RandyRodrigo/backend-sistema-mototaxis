import { AppDataSource } from "../config/appdatasource";
import { Asistencia } from "../entities/asistencia";

const repository = AppDataSource.getRepository(Asistencia);

export const registrarAsistencia = async (data: Partial<Asistencia>): Promise<Asistencia> => {
    const nuevaAsistencia = repository.create(data);
    return await repository.save(nuevaAsistencia);
};

export const obtenerAsistenciasPorMoto = async (numeroMoto: number): Promise<Asistencia[]> => {
    return await repository.find({
        where: { numeroMoto },
        order: { creadoEn: 'DESC' }
    });
};
