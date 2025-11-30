import { transporter } from "../config/mail.config";
import { MAIL_FROM } from "../shared/constants";

export const enviarCorreo = async (para: string, asunto: string, html: string, data: object) => {
    try {
        await transporter.sendMail({
            from: MAIL_FROM,
            to: para,
            subject: asunto,
            html: html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '')
        });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw new Error("Error al enviar el correo");
    }
};