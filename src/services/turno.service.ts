import { AppDataSource } from "../config/appdatasource";
import { Turno } from "../entities/turno";
import { v4 as uuidv4 } from 'uuid';

const repository = AppDataSource.getRepository(Turno);

export const listarTurnos = async (): Promise<Turno[]> => {
    return await repository.find(
        {
            relations: ['paradero']
        }
    );
};

export const insertarTurno = async (data: Partial<Turno>): Promise<Turno> => {
  const nuevoTurno = repository.create({
    idTurno: uuidv4(),
    ...data
  });
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
