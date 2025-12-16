import Joi from "joi";

export const insertarParaderoSchema = Joi.object({
    nombre: Joi.string().max(150).required(),
    direccion: Joi.string().max(255).optional(),
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    radioMetros: Joi.number().integer().optional()
});
