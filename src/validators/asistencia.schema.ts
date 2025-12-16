import Joi from "joi";

export const registrarAsistenciaSchema = Joi.object({
    numeroMoto: Joi.number().required(),
    direccionParadero: Joi.string().max(255).optional(),
    lat: Joi.number().optional(),
    lng: Joi.number().optional()
});

export const obtenerAsistenciasPorMotoSchema = Joi.object({
    numeroMoto: Joi.number().required()
});
