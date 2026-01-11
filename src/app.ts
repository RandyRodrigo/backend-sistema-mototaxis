import express, { Application } from 'express';
import { AppDataSource } from './config/appdatasource';
import { transporter } from './config/mail.config';
import BaseResponse from "./shared/base.response";
import usuarioRouter from './routes/usuario.route';
import reseteoClaveRouter from './routes/reseteo-clave.route';
import motoRouter from './routes/moto.route';
import paraderoRouter from './routes/paradero.route';
import asistenciaRouter from './routes/asistencia.routes';
import turnoRouter from './routes/turno.route';
import programacionRouter from './routes/programacion.route';
import programacionAutomaticaRouter from './routes/programacion-automatica.routes';
import cors from 'cors';
import { FRONTEND_URL } from './shared/constants';
import { iniciarCronProgramacionAutomatica } from './config/cron.config';
import { iniciarCronAsistencia } from './config/cron-asistencia.config';
import { iniciarCronComite24 } from './config/cron-comite24.config';

const app: Application = express();

app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
}));

app.use('/api/v1/usuario', usuarioRouter);
app.use('/api/v1/reseteo-clave', reseteoClaveRouter);
app.use('/api/v1/moto', motoRouter);
app.use('/api/v1/paradero', paraderoRouter);
app.use('/api/v1/asistencia', asistenciaRouter);
app.use('/api/v1/turno', turnoRouter);
app.use('/api/v1/programacion', programacionRouter);
app.use('/api/v1/programacion-automatica', programacionAutomaticaRouter);

app.use((req, res) => {
    res.status(404).json(BaseResponse.error('Recurso no encontrado', 404));
});

export const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('La base de datos se ha conectado correctamente');

        // Iniciar cron jobs
        iniciarCronProgramacionAutomatica();
        iniciarCronAsistencia();
        iniciarCronComite24();
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


