import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants';

export const encriptarClave = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

export const getDiffMinutes = (fechaInicial: Date, fechaFinal: Date = new Date()): number => {
    const diffMs = fechaFinal.getTime() - fechaInicial.getTime();
    return Math.floor(diffMs / (1000 * 60));
}

export const generarUUID = (): string => {
    return uuidv4();
}

export const compararClave = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const generarToken = (idUsuario: string): string => {
    return jwt.sign({ idUsuario }, JWT_SECRET as jwt.Secret, { expiresIn: '24h' });
}

