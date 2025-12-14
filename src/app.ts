import express, { Application } from 'express';
import { AppDataSource } from './config/appdatasource';
import { transporter } from './config/mail.config';
import BaseResponse from "./shared/base.response";
import usuarioRouter from './routes/usuario.route';
import reseteoClaveRouter from './routes/reseteo-clave.route';
import motoRouter from './routes/moto.route';

const app: Application = express();

app.use(express.json());

app.use('/api/v1/usuario', usuarioRouter);
app.use('/api/v1/reseteo-clave', reseteoClaveRouter);
app.use('/api/v1/moto', motoRouter);

app.use((req, res) => {
    res.status(404).json(BaseResponse.error('Recurso no encontrado', 404));
});

export const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('La base de datos se ha conectado correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};

export const startMailServer = async () => {
    try {
        await transporter.verify();
        console.log('Servicio de correo electrónico listo');
    } catch (error) {
        console.error('Error al iniciar el servicio de correo electrónico:', error);
    }
};

export default app;


