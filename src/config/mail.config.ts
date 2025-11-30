import { MAIL_PASSWORD, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_HOST } from "../shared/constants";
import nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
});
