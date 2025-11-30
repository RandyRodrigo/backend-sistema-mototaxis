import Joi from "joi";

export const insertarUsuarioSchema = Joi.object({
    nombreUsuario: Joi.string().required(),
    nombre: Joi.string().required(),
    apellidoPaterno: Joi.string().required(),
    apellidoMaterno: Joi.string().required(),
    correo: Joi.string().email().required(),
    telefono: Joi.string().required(),
    clave: Joi.string().min(6).required() // Mínimo 6 caracteres
});