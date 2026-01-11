import { AppDataSource } from "../config/appdatasource";
import { Asistencia } from "../entities/asistencia";

const repository = AppDataSource.getRepository(Asistencia);

export const registrarEntrada = async (data: Partial<Asistencia>): Promise<Asistencia> => {
    const nuevaAsistencia = repository.create({
        ...data,
        horaEntrada: new Date(),
        estadoEntrada: 'completado' // Initial state
    });
    return await repository.save(nuevaAsistencia);
};

export const registrarSalida = async (idAsistencia: number, data: Partial<Asistencia>): Promise<Asistencia | null> => {
    const asistencia = await repository.findOneBy({ idAsistencia });
    if (!asistencia) return null;

    repository.merge(asistencia, {
        ...data,
        horaSalida: new Date(),
        estadoSalida: 'completado'
    });
    return await repository.save(asistencia);
};

export const obtenerAsistencias = async (idProgramacion?: number): Promise<Asistencia[]> => {
    const whereCondition: any = {};
    if (idProgramacion) {
        whereCondition.idProgramacion = idProgramacion;
    }
    return await repository.find({
        where: whereCondition,
        order: { fechaCreacion: 'DESC' },
        relations: ['programacion']
    });
};
