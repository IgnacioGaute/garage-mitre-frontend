import { Suspense } from 'react';
import { RegisterForm } from '@/app/auth/register/_components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen py-6">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
