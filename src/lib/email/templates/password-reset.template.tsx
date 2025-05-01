import { FOOTER_HTML, SHARED_STYLES } from './const';

export const passwordResetTemplate = ({
  token,
  hostUrl,
}: {
  token: string;
  hostUrl: string;
}) => {
  const resetLink = `${hostUrl}/auth/new-password?token=${token}`;
  const logoUrl = `${hostUrl}/bm-logo.svg`;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #000000;">
    <div style="${SHARED_STYLES.container}">
      <div style="${SHARED_STYLES.header}">
        <img src="${logoUrl}" alt="BetMasters Logo" style="${SHARED_STYLES.logo}" />
        <h1 style="${SHARED_STYLES.title}">Restablecer Contraseña</h1>
      </div>
      
      <div style="${SHARED_STYLES.content}">
        <p style="${SHARED_STYLES.text}">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" style="${SHARED_STYLES.button}">
            Restablecer Contraseña
          </a>
        </div>

        <p style="${SHARED_STYLES.note}">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu cuenta está segura.</p>
      </div>

      ${FOOTER_HTML}
    </div>
  </body>
  </html>
  `;
};