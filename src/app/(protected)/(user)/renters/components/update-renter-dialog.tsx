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
import { PARKING_TYPE } from '@/types/parking-type';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle } from '@/types/vehicle.type';


export function UpdateRenterDialog({ customer, customersRenters }: { customer: Customer, customersRenters:Vehicle[] }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'customer' | 'vehicleRenters'>('customer');
  const [isPending, setIsPending] = useState(false);

  const form = useForm<Partial<UpdateCustomerSchemaType>>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      phone: customer.phone ?? '',
      numberOfVehicles: customer.numberOfVehicles ?? 0,
      comments: customer.comments ?? "",
      customerType: customer.customerType ?? 'RENTER',
      vehicleRenters: customer.vehicleRenters?.map((vehicle) => ({
        id: vehicle.id ?? "",
        garageNumber: vehicle.garageNumber ?? "",
        amount: vehicle.amount ?? 0,
        owner: vehicle.owner ?? ""
      })) ?? [],
    },
  });

  console.log(form.formState)
  


  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'vehicleRenters',
  });

  const handleCustomerSubmit = (values: Partial<UpdateCustomerSchemaType>) => {
    const numberOfVehicles = values.numberOfVehicles ?? 0;
    const currentVehicles = form.getValues('vehicleRenters') ?? [];

    if (currentVehicles.length < numberOfVehicles) {
      const vehiclesToAdd = Array.from(
        { length: numberOfVehicles - currentVehicles.length },
        (_, index) => ({
          id: currentVehicles[index].id || '',
          garageNumber: currentVehicles[index].garageNumber || '',
          amount: currentVehicles[index].amount || 0,
          owner: currentVehicles[index].owner || '',
        })
      );
      // Aquí estamos asegurándonos de que los valores de parking de los vehículos existentes se mantengan
      replace([...currentVehicles, ...vehiclesToAdd]);
    } else if (currentVehicles.length > numberOfVehicles) {
      // Si hay menos vehículos, eliminamos los vehículos extra
      replace(currentVehicles.slice(0, numberOfVehicles));
    }

    setPhase('vehicleRenters');
  };

  const handleVehiclesSubmit = async (values: Partial<UpdateCustomerSchemaType>) => {
    console.log(values)
    setIsPending(true);
    try {
      const data = await updateCustomerAction(customer.id, values);
  
      if (!data || data.error) {
        toast.error(data?.error?.message ?? 'Error desconocido');
      } else {
        toast.success('Inquilino y vehículos actualizados exitosamente');
        setOpen(false);
        setPhase('customer');
        form.reset();
      }
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setIsPending(false);
    }
  };
  

  const getAvailableVehicles = (selectedOwnerIds: string[]) => {
  return customersRenters.filter(vehicle => {
    // Permitir si renterActive es false
    if (!vehicle.rentActive) return true;

    // Permitir si ya está seleccionado por el cliente actual
    return selectedOwnerIds.includes(vehicle.id);
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
          <DialogTitle>{phase === 'customer' ? 'Editar Cliente' : 'Editar Vehículos'}</DialogTitle>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de celular</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Escriba número de celular"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="customerNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número del Cliente</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          placeholder="Escriba número del cliente"
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
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentario</FormLabel>
                      <FormControl>
                        <Textarea disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Formulario de Vehículos */}
            {phase === 'vehicleRenters' && (
              <>
{fields.map((field, index) => {
  const selectedVehicleId = form.watch(`vehicleRenters.${index}.owner`);
  const vehicles = form.watch('vehicleRenters') || [];

  const selectedVehicleIds = form.watch('vehicleRenters')?.map((v: any) => v.owner) ?? [];
  const availableVehicles = getAvailableVehicles(selectedVehicleIds);
  const selectedVehicle = customersRenters.find(v => v.id === selectedVehicleId);

  return (
    <div key={field.id} className="space-y-2">
<FormField
  control={form.control}
  name={`vehicleRenters.${index}.owner`}
  render={({ field }) => {
    console.log('Selected Owner ID:', field.value); // 👈 lo ponés acá

    return (
      <FormItem>
        <FormLabel>¿A qué propietario alquila la cochera?</FormLabel>
        <div>
          <Select
            disabled={isPending}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar propietario" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="GARAGE_MITRE">Garage Mitre</SelectItem>
              {availableVehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.customer.firstName} {vehicle.customer.lastName} ({vehicle.garageNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage />
        </div>
      </FormItem>
    );
  }}
/>


      

      {selectedVehicleId === 'GARAGE_MITRE' ? (
        <>
          <FormField
            control={form.control}
            name={`vehicleRenters.${index}.garageNumber`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Cochera</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="Número de cochera" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`vehicleRenters.${index}.amount`}
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
        </>
      ) : selectedVehicle && (
        <Card>
          <div className="p-2 text-sm">
            <p className='pb-5'>Cochera: {selectedVehicle.garageNumber}</p>
            <p>Monto: ${selectedVehicle.amountRenter}</p>
          </div>
        </Card>
      )}

      <div className='pb-5 pt-5'>
        <Separator />
      </div>
    </div>
  );
  
})}

              </>
            )}

            <div className="flex items-center justify-end gap-2">
              {phase === 'vehicleRenters' && (
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
