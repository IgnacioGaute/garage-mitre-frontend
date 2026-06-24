export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getUsers } from '@/services/users.service';
import { UsersTable } from './components/users-table';
import { userColumns } from './components/user-columns';
import { PageHeader } from '@/components/page-header';

export default async function UserPage() {
  const users = await getUsers();
  const total = users?.data?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:p-8 max-w-7xl">
      <PageHeader
        breadcrumb={['Garage Mitre', 'Administración', 'Usuarios']}
        title="Usuarios del sistema"
        description={
          total > 0
            ? `${total} cuentas activas — operadores y administradores.`
            : 'Creá la primera cuenta para empezar a operar.'
        }
      />
      <UsersTable columns={userColumns} data={users?.data || []} />
    </div>
  );
}
