import { AppDataSource } from "../config/appdatasource";
import { ReseteoClave } from "../entities/reseteo-clave";
import { generarUUID } from "../shared/util";

const repository = AppDataSource.getRepository(ReseteoClave);

export const insertarReseteoClave = async (data: Partial<ReseteoClave>): Promise<ReseteoClave> => {
    const nuevoReseteoClave = repository.create({
        idReseteoClave: generarUUID(),
        ...data
    });
    return await repository.save(nuevoReseteoClave);
};