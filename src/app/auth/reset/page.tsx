import { Suspense } from 'react';
import { ResetForm } from '@/app/auth/reset/_components/reset-form';

export default function ResetPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
