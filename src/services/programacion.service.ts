import { AppDataSource } from "../config/appdatasource";
import { Programacion } from "../entities/programacion";
import { Moto } from "../entities/moto";
import { Paradero } from "../entities/paradero";
import { Turno } from "../entities/turno";

const repository = AppDataSource.getRepository(Programacion);
const motoRepository = AppDataSource.getRepository(Moto);
const paraderoRepository = AppDataSource.getRepository(Paradero);
const turnoRepository = AppDataSource.getRepository(Turno);

export const listarProgramacion = async (): Promise<Programacion[]> => {
    return await repository.find({
        relations: ['moto', 'paradero', 'turno']
    });
};

export const insertarProgramacion = async (data: { idMoto: string, idParadero: string, idTurno: string, fecha: string }): Promise<Programacion> => {
    const moto = await motoRepository.findOneBy({ idMoto: data.idMoto });
    if (!moto) throw new Error('Moto no encontrada');

    const paradero = await paraderoRepository.findOneBy({ idParadero: data.idParadero });
    if (!paradero) throw new Error('Paradero no encontrado');

    const turno = await turnoRepository.findOneBy({ idTurno: data.idTurno });
    if (!turno) throw new Error('Turno no encontrado');

    const nuevaProgramacion = repository.create({
        moto,
        paradero,
        turno,
        fecha: data.fecha
    });

    return await repository.save(nuevaProgramacion);
};

export const actualizarProgramacion = async (idProgramacion: number, data: Partial<Programacion>): Promise<Programacion> => {
  const programacion = await repository.findOne({ where: { idProgramacion } });
  if (!programacion) {
      throw new Error('Paradero no encontrado');
  }
  // remove id from data
  const { idProgramacion: id, ...datosToUpdate } = data;
  repository.merge(programacion, datosToUpdate);
  return await repository.save(programacion);
}

export const eliminarProgramacion = async (idProgramacion: number): Promise<void> => {
    await repository.delete(idProgramacion);
};

export const obtenerProgramacionPorId = async (idProgramacion: number): Promise<Programacion | null> => {
    return await repository.findOne({
        where: { idProgramacion },
        relations: ['moto', 'paradero', 'turno']
    });
};
