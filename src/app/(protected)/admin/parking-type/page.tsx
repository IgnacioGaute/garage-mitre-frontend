
import { getUsers } from '@/services/users.service';
import { ParkingTypeTable } from './components/parking-types-table';
import { parkingTypeColumns } from './components/parking-type-columns';
import { getParkingTypes } from '@/services/customers.service';
import { ParkingCircle } from 'lucide-react';


export default async function ParkingTypePage() {
  const parkingTypes = await getParkingTypes();
  

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6 sm:mb-8 bg-secondary/50 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
        <ParkingCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Tipos de Estacionamientos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
           Gestionar los tipos de estacionamientos.
          </p>
        </div>
      </div>
      <ParkingTypeTable
        columns={parkingTypeColumns}
        data={parkingTypes?.data || []}
      />
    </div>
  );
}
