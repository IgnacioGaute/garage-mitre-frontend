
import { CreditCardIcon } from 'lucide-react';
import { getCustomers } from '@/services/customers.service';
import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import GenerateReceiptsButton from '../components/all-receipts-button';
import { PrivateParkingTable } from './components/private-parking-table';
import { PrivateParkingColumns } from './components/private-parking-columns';
import { ExportCustomersExcel } from '../components/export-customers-excel';
import { DropdownMenuAction } from '../components/drop-menu-actions';


export default async function PrivateParkingPage() {
  const customers = await getCustomers(CUSTOMER_TYPE[2]);

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6 sm:mb-8 bg-secondary/50 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
        <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Administrar Estacionamientos Privados</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestiona todos los Estacionamientos Privados.
          </p>
        </div>
      </div>
      <div className="mb-4">
        <DropdownMenuAction customers={customers || []} />
      </div>
      <PrivateParkingTable
        columns={PrivateParkingColumns}
        data={customers || []}
      />
    </div>
  );
}
