import { Resend } from 'resend';
import { passwordResetTemplate } from './templates';


const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM_ADDRESS as string;

export const sendPasswordResetEmail = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const htmlContent = passwordResetTemplate({
    token,
    hostUrl: `${process.env.NEXT_PUBLIC_HOST_URL}`,
  });
  try {
    const response = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Restablece tu contraseña',
      html: htmlContent,
    });
    console.log('sendPasswordResetEmail:', email, response);
    return response;
  } catch (error) {
    console.error(error);
  }
};
