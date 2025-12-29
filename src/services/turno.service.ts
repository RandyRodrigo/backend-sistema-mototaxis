import { AppDataSource } from "../config/appdatasource";
import { Turno } from "../entities/turno";

const repository = AppDataSource.getRepository(Turno);

export const listarTurnos = async (): Promise<Turno[]> => {
    return await repository.find();
};

export const insertarTurno = async (data: Partial<Turno>): Promise<Turno> => {
    const nuevoTurno = repository.create(data);
    return await repository.save(nuevoTurno);
};

export const obtenerTurnoPorId = async (idTurno: string): Promise<Turno | null> => {
    return await repository.findOne({ where: { idTurno } });
};

export const eliminarTurno = async (idTurno: string): Promise<void> => {
    await repository.delete(idTurno);
};

export const actualizarTurno = async (idTurno: string, data: Partial<Turno>): Promise<Turno | null> => {
    await repository.update(idTurno, data);
    return await obtenerTurnoPorId(idTurno);
};
