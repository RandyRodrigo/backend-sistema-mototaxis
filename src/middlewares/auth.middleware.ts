import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../shared/constants';
import BaseResponse from '../shared/base.response';

// Extender la interfaz Request de Express para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                idUsuario: string;
            };
        }
    }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json(BaseResponse.error('Token no proporcionado', 401));
            return;
        }

        // El formato esperado es: "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json(BaseResponse.error('Formato de token inválido', 401));
            return;
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as { idUsuario: string };

        // Agregar el usuario al request
        req.user = {
            idUsuario: decoded.idUsuario
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json(BaseResponse.error('Token expirado', 401));
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json(BaseResponse.error('Token inválido', 401));
            return;
        }
        res.status(500).json(BaseResponse.error('Error al verificar token', 500));
    }
};
