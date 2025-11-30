import express, { Application } from 'express';
import { AppDataSource } from './config/appdatasource';
import BaseResponse from "./shared/base.response";

const app: Application = express();

app.use(express.json());

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

export default app;


