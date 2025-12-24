import Joi from "joi";

export const insertarTurnoSchema = Joi.object({
    nombre: Joi.string().required().max(100),
    horaInicio: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    horaFin: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    activo: Joi.number().valid(0, 1).optional()
});
