import { AppDataSource } from "../config/appdatasource";
import { Paradero } from "../entities/paradero";

const repository = AppDataSource.getRepository(Paradero);

export const insertarParadero = async (data: Partial<Paradero>): Promise<Paradero> => {
    const nuevoParadero = repository.create(data);
    return await repository.save(nuevoParadero);
};

export const listarParaderos = async (): Promise<Paradero[]> => {
    return await repository.find();
};

export const actualizarParadero = async (idParadero: number, data: Partial<Paradero>): Promise<Paradero> => {
    const paradero = await repository.findOne({ where: { idParadero } });
    if (!paradero) {
        throw new Error('Paradero no encontrado');
    }
    // remove id from data
    const { idParadero: id, ...datosToUpdate } = data;
    repository.merge(paradero, datosToUpdate);
    return await repository.save(paradero);
};