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

// Función para mapear los valores de parkingType a textos legibles
const parkingTypeLabels: Record<string, string> = {
  ONE_TYPE: 'Tipo Único',
  EXPENSES_1: 'Expensas 1',
  EXPENSES_2: 'Expensas 2',
  EXPENSES_3: 'Expensas 3',
};

export function ViewCustomerDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);

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
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo de Estacionamiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.vehicles.map((vehicle, index) => (
                  <TableRow key={index}>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.vehicleBrand}</TableCell>
                    <TableCell>${vehicle.amount}</TableCell>
                    <TableCell>{parkingTypeLabels[vehicle.parkingType]}</TableCell>
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
