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
import { Owner } from '@/types/owner.type';

export function ViewOwnerDialog({ owner }: { owner: Owner }) {
  const [open, setOpen] = useState(false);

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
          <p><strong>Nombre:</strong> {owner.firstName}</p>
          <p><strong>Apellido:</strong> {owner.lastName}</p>
          <p><strong>Email:</strong> {owner.email}</p>
          <p><strong>Dirección:</strong> {owner.address}</p>
          <p><strong>Número de Documento:</strong> {owner.documentNumber}</p>
          <p><strong>Número de Vehículos:</strong> {owner.numberOfVehicles}</p>

          {/* Sección de Vehículos */}
          {owner.vehicleLicensePlates.map((plate, index) => (
            <div key={index} className="border-t pt-2">
              <p><strong>Vehículo {index + 1}</strong></p>
              <p><strong>Patente:</strong> {plate}</p>
              <p><strong>Marca:</strong> {owner.vehicleBrands[index] || 'N/A'}</p>
            </div>
          ))}
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
