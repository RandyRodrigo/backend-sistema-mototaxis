export const HTML_TEMPLATE_RESET_PASSWORD = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="color-scheme" content="light only">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Recuperación de contraseña</title>
  </head>
  <body style="margin:0; padding:0; background:#f6f7fb;">
    <span style="display:none; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">
      Restablece tu contraseña de Sistema Mototaxis.
    </span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1f2937; border-radius:16px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#6CB12E; padding:24px;" align="left">
                <div style="display:flex; align-items:center; gap:10px;">
                  <a><img src="https://i.ibb.co/whGx2d8S/Logo1.png" alt="Sistema Mototaxis Logo" width="80" height="80" style="border-radius:50%; display:block;"></a>
                  <div style="font-family:Arial, Helvetica, sans-serif; font-size:20px; color:#ffffff; font-weight:bold;">
                    Sistema Mototaxis
                  </div>
                </div>
                <div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#e5e7eb; margin-top:6px;">
                  Recuperación de contraseña
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 24px 20px 24px; font-family:Arial, Helvetica, sans-serif;">
                <h1 style="margin:0 0 14px 0; font-size:22px; line-height:1.4; color:#ffffff;">
                  Hola {{nombre}},
                </h1>
                <p style="margin:0 0 18px 0; font-size:15px; line-height:1.6; color:#d1d5db;">
                  Hemos recibido una solicitud para restablecer tu contraseña de Sistema Mototaxis. Para continuar, haz clic en el botón:
                </p>

                <!-- Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                  <tr>
                    <td align="center" bgcolor="#8c00c4ff" style="border-radius:10px;">
                      <a href="{{enlace}}" style="display:inline-block; padding:14px 24px; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#ffffff; text-decoration:none; font-weight:bold;">
                        Restablecer contraseña
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback link -->
                <p style="margin:14px 0 0 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style="margin:4px 0 0 0; font-family:Consolas, 'Courier New', monospace; font-size:12px; line-height:1.6; color:#FFB800; word-break:break-all;">
                  {{enlace}}
                </p>

                <!-- Notice -->
                <div style="margin:22px 0 0 0; padding:14px; background:#111827; border:1px solid #ff0000ff; border-radius:12px;">
                  <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                    Si no solicitaste este cambio, puedes ignorar este correo con seguridad.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 24px; border-top:1px solid #fffb00ff; font-family:Arial, Helvetica, sans-serif;">
                <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#9ca3af;">
                  Saludos,<br>El equipo de Los Incas
                </p>
                <p style="margin:8px 0 0 0; font-size:11px; line-height:1.6; color:#6b7280;">
                  Este es un mensaje automático, por favor no respondas a este correo.
                </p>
              </td>
            </tr>
          </table>

          <div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; color:#9ca3af; margin-top:12px;">
            © ${new Date().getFullYear()} Los Incas. Todos los derechos reservados.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;