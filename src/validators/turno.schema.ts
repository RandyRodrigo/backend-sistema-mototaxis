import Joi from "joi";

export const insertarTurnoSchema = Joi.object({
    nombre: Joi.string().required().max(100),
    horaInicio: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    horaFin: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
    activo: Joi.number().valid(0, 1).optional()
});

export const actualizarTurnoSchema = Joi.object({
    idTurno: Joi.number().required().messages({
        'any.required': 'El idTurno es obligatorio.'
    }),
    nombre: Joi.string().max(100).optional(),
    horaInicio: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    horaFin: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional(),
    activo: Joi.number().valid(0, 1).optional()
});
