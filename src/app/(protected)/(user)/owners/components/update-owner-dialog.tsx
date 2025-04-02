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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParkingType } from '@/types/parking-type';
import { Separator } from '@/components/ui/separator';


export function UpdateOwnerDialog({ customer }: { customer: Customer }) {
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
      customerType: customer.customerType ?? 'OWNER',
      vehicles: customer.vehicles?.map((vehicle) => ({
        garageNumber: vehicle.garageNumber ?? "",
        parking: vehicle.parkingType?.parkingType ?? PARKING_TYPE[0], // Aseguramos que el parking se asigna correctamente
      })) ?? [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });
  const handleCustomerSubmit = (values: Partial<UpdateCustomerSchemaType>) => {
    const numberOfVehicles = values.numberOfVehicles ?? 0;
    const currentVehicles = form.getValues('vehicles') ?? [];
  
    // Si el número de vehículos es mayor, añadimos vehículos nuevos con los valores por defecto
    if (currentVehicles.length < numberOfVehicles) {
      const vehiclesToAdd = Array.from(
        { length: numberOfVehicles - currentVehicles.length },
        (_, index) => ({
          garageNumber: currentVehicles[index].garageNumber || '',
          parking: currentVehicles[index].parking, // Establecer el valor predeterminado del parking
        })
      );
      // Aquí estamos asegurándonos de que los valores de parking de los vehículos existentes se mantengan
      replace([...currentVehicles, ...vehiclesToAdd]);
    } else if (currentVehicles.length > numberOfVehicles) {
      // Si hay menos vehículos, eliminamos los vehículos extra
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
        toast.success('Propietario y vehículos actualizados exitosamente');
        setOpen(false);
        setPhase('customer');
        form.reset();
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
          Editar Propietario
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} placeholder="Escriba Dirección" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          placeholder="Escriba número de documento"
                          {...field}
                        />
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
                  <div key={field.id} className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`vehicles.${index}.garageNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Cochera</FormLabel>
                          <FormControl>
                          <Input disabled={isPending} placeholder="Numero de cochera" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
            <FormField
              control={form.control}
              name={`vehicles.${index}.parking`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vehículo</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="EXPENSES_1">Expensas 1</SelectItem>
                        <SelectItem value="EXPENSES_2">Expensas 2</SelectItem>
                        <SelectItem value="EXPENSES_ZOM_1">Expensas salon 1</SelectItem>
                        <SelectItem value="EXPENSES_ZOM_2">Expensas salon 2</SelectItem>
                        <SelectItem value="EXPENSES_ZOM_3">Expensas salon 3</SelectItem>
                        <SelectItem value="EXPENSES_RICARDO_AZNAR">Expensas Ricado Aznar</SelectItem>
                        <SelectItem value="EXPENSES_ADOLFO_FONTELA">Expensas Adolfo Fontela</SelectItem>
                        <SelectItem value="EXPENSES_NIDIA_FONTELA">Expensas Nidia Fontela</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                    <div className='p-5'>
                    <Separator/>
                    </div>
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