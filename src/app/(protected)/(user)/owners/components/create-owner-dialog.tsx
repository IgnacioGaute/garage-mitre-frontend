'use client';

import { useState, useTransition } from 'react';
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
import { createCustomerAction } from '@/actions/customers/create-customer.action';
import { customerSchema, CustomerSchemaType } from '@/schemas/customer.schema';
import { PARKING_TYPE, ParkingType } from '@/types/parking-type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';


export function CreateOwnerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<'customer' | 'vehicles'>('customer');

  const form = useForm<CustomerSchemaType>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      documentNumber: undefined,
      numberOfVehicles: 1,
      customerType: 'OWNER',
      vehicles: [],
    },
  });
  

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });

  const handleCustomerSubmit = (values: CustomerSchemaType) => {
    const numberOfVehicles = values.numberOfVehicles;
    const currentVehicles = form.getValues('vehicles');
  
    if (currentVehicles.length < numberOfVehicles) {
      const vehiclesToAdd = Array.from(
        { length: numberOfVehicles - currentVehicles.length },
        () => ({
          garageNumber: '',
          parking: PARKING_TYPE[1]
        })
      );
      append(vehiclesToAdd);
    } else if (currentVehicles.length > numberOfVehicles) {
      const excessCount = currentVehicles.length - numberOfVehicles;
      for (let i = 0; i < excessCount; i++) {
        remove(currentVehicles.length - 1);
      }
    }
  
    setPhase('vehicles');
  };
  
  const handleVehiclesSubmit = (values: CustomerSchemaType) => {

    startTransition(async () => {
      const data = await createCustomerAction(values); // Se almacena el resultado de la acción en 'data'
  
      if (!data || data.error) {
        // Verifica si data.error es un string o un objeto antes de acceder a 'message'
        const errorMessage = typeof data.error === 'string' 
          ? data.error // Si el error es solo un string, mostramos ese mensaje
          : data.error.message; // Si el error es un objeto, accedemos a 'message'
  
        toast.error(errorMessage); // Mostramos el mensaje de error
      } else {
        toast.success('Propietario y vehículos creados exitosamente');
        form.reset();
        setOpen(false);
        setPhase('customer');
      }
    });
  };
  
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" onClick={() => setOpen(true)}>
          Crear Propietario
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>{phase === 'customer' ? 'Crear Cliente' : 'Crear Vehículos'}</DialogTitle>
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
