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
