import Joi from "joi";

export const insertarUsuarioSchema = Joi.object({
    nombre: Joi.string().required(),
    apellidoPaterno: Joi.string().required(),
    apellidoMaterno: Joi.string().required(),
    correo: Joi.string().email().required(),
    telefono: Joi.string().required(),
    clave: Joi.string().min(6).required() // Mínimo 6 caracteres
});

export const loginUsuarioSchema = Joi.object({
    correo: Joi.string().email().required().messages({
        'string.base': 'El correo debe ser un texto.',
        'string.email': 'Debes ingresar un correo válido.',
        'any.required': 'El campo correo es obligatorio.',
    }),
    clave: Joi.string().min(6).required() // Mínimo 6 caracteres
});