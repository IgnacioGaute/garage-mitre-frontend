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

export function ViewCustomerDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  console.log(customer.vehicles)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          Ver
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>Información del Propietario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm sm:text-base">
          <p>
            <strong>Nombre:</strong> {customer.firstName}
          </p>
          <p>
            <strong>Apellido:</strong> {customer.lastName}
          </p>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          <p>
            <strong>Dirección:</strong> {customer.address}
          </p>
          <p>
            <strong>Número de Documento:</strong> {customer.documentNumber}
          </p>
          <p>
            <strong>Número de Vehículos:</strong> {customer.numberOfVehicles}
          </p>

          {/* Sección de Vehículos */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Vehículos</h3>
            {customer.vehicles && customer.vehicles.length > 0 ? (
              <ul className="space-y-2">
                {customer.vehicles.map((vehicle, index) => (
                  <li key={index} className="border-b pb-2">
                    <p>
                      <strong>Placa:</strong> {vehicle.licensePlate}
                    </p>
                    <p>
                      <strong>Marca:</strong> {vehicle.vehicleBrand}
                    </p>
                    <p>
                      <strong>Monto:</strong> ${vehicle.amount}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay vehículos registrados para este cliente.</p>
            )}
          </div>
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
