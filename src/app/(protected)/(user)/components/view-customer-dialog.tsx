'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/cutomer.type';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export function ViewCustomerDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const parkingTypeMap: Record<string, string> = {
    EXPENSES_1: 'Expensas 1',
    EXPENSES_2: 'Expensas 2',
    EXPENSES_ZOM_1: 'Expensas salon 1',
    EXPENSES_ZOM_2: 'Expensas salon 2',
    EXPENSES_ZOM_3: 'Expensas salon 3',
    EXPENSES_RICARDO_AZNAR: 'Expensas Ricardo Aznar',
    EXPENSES_ADOLFO_FONTELA: 'Expensas Adolfo Fontela',
    EXPENSES_NIDIA_FONTELA: 'Expensas Nidia Fontela',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button variant="ghost" className="w-full justify-start" size="sm">
          Ver Detalles
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-lg sm:max-w-xl">
        <DialogHeader className="items-center">
          <DialogTitle>Información del Cliente</DialogTitle>
        </DialogHeader>

        {/* Datos del Cliente */}
        <Card>
          <CardContent className="p-4 space-y-3 text-sm sm:text-base">
            <p><strong>Nombre:</strong> {customer.firstName} {customer.lastName}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Dirección:</strong> {customer.address}</p>
            <p><strong>Documento:</strong> {customer.documentNumber}</p>
            <p><strong>Número de Vehículos:</strong> {customer.numberOfVehicles}</p>
          </CardContent>
        </Card>

        {/* Sección de Vehículos */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Vehículos Registrados</h3>
          {customer.vehicles && customer.vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {customer.customerType === 'OWNER'?(
                  <TableHead>Número de Cochera</TableHead>
                  ):(
                  <TableHead>Placa</TableHead>
                  )}
                  {customer.customerType !== 'OWNER' && (
                    <TableHead>Marca</TableHead>
                  )}
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo de Estacionamiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.vehicles.map((vehicle, index) => (
                  <TableRow key={index}>
                    {vehicle.licensePlate === null ?(
                    <TableCell>{vehicle.garageNumber}</TableCell>
                    ):(
                      <TableCell>{vehicle.licensePlate}</TableCell>
                    )}
                     {customer.customerType !== 'OWNER' && (
                    <TableCell>{vehicle.vehicleBrand}</TableCell>
                  )}
                    <TableCell>${vehicle.amount}</TableCell>
                    {vehicle.parkingType !== null ? (
                      <TableCell>{parkingTypeMap[vehicle.parkingType.parkingType] || vehicle.parkingType.parkingType}</TableCell>
                    ): (
                      <TableCell>Alquiler</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 mt-2">No hay vehículos registrados.</p>
          )}
        </div>

        {/* Botón de Cerrar */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
