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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { updateCustomerAction } from '@/actions/customers/update-customer.action';
import { Customer } from '@/types/cutomer.type';
import {
  updateCustomerSchema,
  UpdateCustomerSchemaType,
} from '@/schemas/customer.schema';
import { X } from 'lucide-react';
import { PARKING_TYPE } from '@/types/vehicle.type';

export function UpdateRenterDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'customer' | 'vehicles'>('customer');
  const [isPending, setIsPending] = useState(false);

  const form = useForm<Partial<UpdateCustomerSchemaType>>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      documentNumber: customer.documentNumber ?? 0,
      numberOfVehicles: customer.numberOfVehicles ?? 0,
      customerType: customer.customerType ?? 'RENTER',
      vehicles: customer.vehicles ?? [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });

  const handleCustomerSubmit = (values: Partial<UpdateCustomerSchemaType>) => {
    const numberOfVehicles = values.numberOfVehicles ?? 0;
    const currentVehicles = form.getValues('vehicles') ?? [];

    if (currentVehicles.length < numberOfVehicles) {
      const vehiclesToAdd = Array.from(
        { length: numberOfVehicles - currentVehicles.length },
        () => ({
          licensePlate: '',
          vehicleBrand: '',
          amount: 0,
          parkingType: PARKING_TYPE[0]
        })
      );
      replace([...currentVehicles, ...vehiclesToAdd]);
    } else if (currentVehicles.length > numberOfVehicles) {
      replace(currentVehicles.slice(0, numberOfVehicles));
    }

    setPhase('vehicles');
  };

  const handleVehiclesSubmit = (values: Partial<UpdateCustomerSchemaType>) => {
    setIsPending(true);
    updateCustomerAction(customer.id, values).then((data) => {
      if (!data || data.error) {
        toast.error(data.error ?? 'Error desconocido');
      } else {
        toast.success('Inquilino actualizado exitosamente');
        form.reset();
        setOpen(false);
        setPhase('customer');
      }
      setIsPending(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start"
          size="sm"
          onClick={() => setOpen(true)}
        >
          Editar Inquilino
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>
            {phase === 'customer' ? 'Editar Cliente' : 'Editar Vehículos'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              phase === 'customer' ? handleCustomerSubmit : handleVehiclesSubmit
            )}
            className="space-y-4"
          >
            {/* Formulario de Cliente */}
            {phase === 'customer' && (
              <>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} placeholder="Escriba Nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} placeholder="Escriba Apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} placeholder="Escriba Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfVehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de vehículos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          min={1}
                          placeholder="Escriba número de vehículos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Formulario de Vehículos */}
            {phase === 'vehicles' && (
              <>
{fields.map((field, index) => (
  <div key={field.id} className="space-y-2 relative border p-4 rounded-md">
    <FormField
      control={form.control}
      name={`vehicles.${index}.licensePlate`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Placa del vehículo {index + 1}</FormLabel>
          <FormControl>
            <Input disabled={isPending} placeholder="Escriba la placa" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`vehicles.${index}.vehicleBrand`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Marca del vehículo {index + 1}</FormLabel>
          <FormControl>
            <Input disabled={isPending} placeholder="Escriba la marca" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name={`vehicles.${index}.amount`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Monto del vehículo {index + 1}</FormLabel>
          <FormControl>
            <Input
              type="number"
              disabled={isPending}
              placeholder="Escriba el monto"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <button
      type="button"
      className="absolute top-2 right-2 hover:text-red-700"
      onClick={() => {
        // Eliminar el vehículo del array
        remove(index);
        // Actualizar el número de vehículos
        form.setValue('numberOfVehicles', fields.length - 1);
      }}
    >
      <X className="w-5 h-5" /> {/* Ícono de cruz */}
    </button>
  </div>
))}

              </>
            )}

            <div className="flex items-center justify-end gap-2">
              {phase === 'vehicles' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhase('customer')}
                >
                  Atrás
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {phase === 'customer' ? 'Siguiente' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
