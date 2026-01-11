import Joi from "joi";

export const registrarEntradaSchema = Joi.object({
    idProgramacion: Joi.number().required(),
    latEntrada: Joi.number().optional(),
    lngEntrada: Joi.number().optional(),
    precisionEntradaMetros: Joi.number().integer().optional()
});

export const registrarSalidaSchema = Joi.object({
    idAsistencia: Joi.number().required(),
    latSalida: Joi.number().optional(),
    lngSalida: Joi.number().optional(),
    precisionSalidaMetros: Joi.number().integer().optional()
});

export const obtenerAsistenciasSchema = Joi.object({
    idProgramacion: Joi.number().optional(),
    fecha: Joi.date().iso().optional()
});
