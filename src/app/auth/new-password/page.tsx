import { Suspense } from 'react';
import { NewPasswordForm } from '@/app/auth/new-password/_components/new-password-form';

export default function NewPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
