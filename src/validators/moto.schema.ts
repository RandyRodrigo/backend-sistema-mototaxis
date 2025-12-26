import joi from "joi";

export const insertarMotoSchema = joi.object({
    numeroMoto: joi.number().required()
});

export const asignarUsuarioAMotoSchema = joi.object({
    numeroMoto: joi.number().required()
});

export const actualizarMotoSchema = joi.object({
    idMoto: joi.string().required().messages({
        'any.required': 'El idMoto es obligatorio.'
    }),
    numeroMoto: joi.number().optional(),
    placa: joi.string().optional(),
    estado: joi.string().optional(),
    estadoAuditoria: joi.string().optional()
});
