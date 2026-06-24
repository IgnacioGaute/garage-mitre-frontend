export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getCustomers, getParkingTypes } from '@/services/customers.service';
import { OwnersTable } from './components/owners-table';
import { OwnerColumns } from './components/owner-columns';
import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { PageHeader } from '@/components/page-header';

export default async function OwnerPage() {
  const customers = await getCustomers(CUSTOMER_TYPE[0]);
  const parkingTypes = await getParkingTypes();
  const count = customers?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:p-8 max-w-7xl">
      <PageHeader
        breadcrumb={['Garage Mitre', 'Operación', 'Propietarios']}
        title="Propietarios"
        description={
          count > 0
            ? `${count} propietarios registrados.`
            : 'Creá el primer propietario para empezar a operar.'
        }
      />

      <div className="mt-2">
        <OwnersTable
          columns={OwnerColumns}
          data={customers || []}
          parkingTypes={parkingTypes?.data || []}
        />
      </div>
    </div>
  );
}
