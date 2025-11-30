import 'dotenv/config';
export const BASE_URL_API: string = process.env.BASE_URL_API || 'http://localhost:3000';

export const DB_HOST: string = process.env.DB_HOST || '';
export const DB_PORT: string = process.env.DB_PORT || '';
export const DB_USERNAME: string = process.env.DB_USERNAME || '';
export const DB_PASSWORD: string = process.env.DB_PASSWORD || '';
export const DB_DATABASE: string = process.env.DB_DATABASE || '';
export const DB_TYPE: string = process.env.DB_TYPE || '';
export const DB_LOGGING: string = process.env.DB_LOGGING || '';

export const MAIL_FROM: string = process.env.MAIL_FROM || '';
export const MAIL_HOST: string = process.env.MAIL_HOST || '';
export const MAIL_PORT: string = process.env.MAIL_PORT || '';
export const MAIL_USER: string = process.env.MAIL_USER || '';
export const MAIL_PASSWORD: string = process.env.MAIL_PASSWORD || '';
export const MAIL_SECURE: string = process.env.MAIL_SECURE || '';