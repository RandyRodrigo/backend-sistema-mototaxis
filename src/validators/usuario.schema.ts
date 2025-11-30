import Joi from "joi";

export const insertarUsuarioSchema = Joi.object({
    nombre: Joi.string().required(),
    apellidoPaterno: Joi.string().required(),
    apellidoMaterno: Joi.string().required(),
    correo: Joi.string().email().required(),
    telefono: Joi.string().required(),
    clave: Joi.string().min(6).required().messages({
        'string.base': 'La clave debe ser un texto.',
        'string.min': 'La clave debe tener al menos 6 caracteres.',
        'any.required': 'El campo clave es obligatorio.',
    }) // Mínimo 6 caracteres
});

export const loginUsuarioSchema = Joi.object({
    correo: Joi.string().email().required().messages({
        'string.base': 'El correo debe ser un texto.',
        'string.email': 'Debes ingresar un correo válido.',
        'any.required': 'El campo correo es obligatorio.',
    }),
    clave: Joi.string().min(6).required()
});

export const recuperarClaveSchema = Joi.object({
    correo: Joi.string().email().required().messages({
        'string.base': 'El correo debe ser un texto.',
        'string.email': 'Debes ingresar un correo válido.',
        'any.required': 'El campo correo es obligatorio.',
    })
});

export const resetearClaveSchema = Joi.object({
    clave: Joi.string().min(6).required().messages({
        'string.base': 'La clave debe ser un texto.',
        'string.min': 'La clave debe tener al menos 6 caracteres.',
        'any.required': 'El campo clave es obligatorio.',
    }),
    confirmarClave: Joi.string().required().messages({
        'string.base': 'La confirmación de clave debe ser un texto.',
        'any.required': 'El campo confirmación de clave es obligatorio.',
    })
});