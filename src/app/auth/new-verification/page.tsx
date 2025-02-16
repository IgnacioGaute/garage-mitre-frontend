import { Suspense } from 'react';
import { NewVerificationForm } from '@/app/auth/new-verification/_components/verification-form';

export default function NewVerificationPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Suspense>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}
