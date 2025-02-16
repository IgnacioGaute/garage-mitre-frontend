import Link from 'next/link';
import { Button } from '@/components/ui/button';

enum Error {
  Configuration = 'Configuration',
  AccessDenied = 'AccessDenied',
  Verification = 'Verification',
  Default = 'Default',
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      Hubo un problema con la configuración del servidor. Nuestro equipo técnico
      ha sido notificado. Por favor, intenta nuevamente más tarde. Si el
      problema persiste, contáctanos.
    </p>
  ),
  [Error.AccessDenied]: (
    <p>
      Lo sentimos, no tienes permiso para acceder. Si crees que esto es un
      error, por favor contacta a nuestro equipo de soporte. Recuerda que debes
      tener una invitación válida para registrarte en la plataforma.
    </p>
  ),
  [Error.Verification]: (
    <p>
      No pudimos verificar tu correo electrónico. El enlace puede haber expirado
      o ya ha sido utilizado. Por favor, solicita un nuevo enlace de
      verificación.
    </p>
  ),
  [Error.Default]: (
    <p>
      Ocurrió un error inesperado. Por favor, intenta nuevamente. Si el problema
      persiste, no dudes en contactarnos para recibir ayuda.
    </p>
  ),
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;
  const error = p.error as Error;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-background overflow-hidden">
      <div className="max-w-md w-full bg-foreground border border-gray-200 rounded-lg shadow p-6 text-center">
        <h5 className="mb-4 text-xl font-bold text-background">
          Ups, algo salió mal
        </h5>
        <div className="mb-6 text-gray-700">
          {errorMap[error] || errorMap[Error.Default]}
        </div>
        <Link href="/">
          <Button variant="secondary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
