import Joi from "joi";

export const insertarProgramacionSchema = Joi.object({
    idMoto: Joi.string().guid({ version: 'uuidv4' }).required(),
    idParadero: Joi.string().required(),
    idTurno: Joi.string().required(),
    fecha: Joi.date().iso().required()
});

export const actualizarProgramacionSchema = Joi.object({
  idProgramacion: Joi.string().required().messages({
      'any.required': 'El idProgramacion es obligatorio.'
  }),
  idMoto: Joi.string().optional(),
  idParadero: Joi.string().optional(),
  idTurno: Joi.string().optional(),
  fecha: Joi.date().iso().optional()
})

export const obtenerProgramacionDeHoyPorMotoSchema = Joi.object({
    idMoto: Joi.string().required(),
    fecha: Joi.date().iso().required()
})
