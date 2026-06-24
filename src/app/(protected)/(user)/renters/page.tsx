export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getCustomers, getCustomerVehicleRenter } from '@/services/customers.service';
import { RentersTable } from './components/renters-table';
import { renterColumns } from './components/renter-columns';
import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { PageHeader } from '@/components/page-header';

export default async function RenterPage() {
  const customers = await getCustomers(CUSTOMER_TYPE[1]);
  const customersRenters = await getCustomerVehicleRenter();
  const count = customers?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:p-8 max-w-7xl">
      <PageHeader
        breadcrumb={['Garage Mitre', 'Operación', 'Inquilinos']}
        title="Inquilinos"
        description={
          count > 0
            ? `${count} inquilinos registrados.`
            : 'Creá el primer inquilino para empezar a operar.'
        }
      />

      <div className="mt-2">
        <RentersTable
          columns={renterColumns}
          data={customers || []}
          customersRenters={customersRenters || []}
        />
      </div>
    </div>
  );
}
