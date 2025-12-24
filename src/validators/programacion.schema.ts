import Joi from "joi";

export const insertarProgramacionSchema = Joi.object({
    idMoto: Joi.string().guid({ version: 'uuidv4' }).required(),
    idParadero: Joi.number().required(),
    idTurno: Joi.number().required(),
    fecha: Joi.date().iso().required()
});
