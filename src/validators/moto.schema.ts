import joi from "joi";

export const insertarMotoSchema = joi.object({
    numeroMoto: joi.number().required()
});

export const asignarUsuarioAMotoSchema = joi.object({
    numeroMoto: joi.number().required()
});
