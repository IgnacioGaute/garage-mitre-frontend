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
import { PARKING_TYPE } from '@/types/parking-type';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/cutomer.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle } from '@/types/vehicle.type';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CreateRenterDialog({ customersRenters } : { customersRenters:Vehicle[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<'customer' | 'vehicleRenters'>('customer');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();

  const form = useForm<CustomerSchemaType>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      comments:'',
      customerNumber: undefined,
      numberOfVehicles: 1,
      customerType: 'RENTER',
      vehicleRenters: [],
    },
  });


  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'vehicleRenters',
  });

  const handleCustomerSubmit = (values: CustomerSchemaType) => {
    const numberOfVehicles = values.numberOfVehicles;
    const currentVehicles = form.getValues('vehicleRenters') ?? [];

  
    if (currentVehicles.length < numberOfVehicles) {
      const vehiclesToAdd = Array.from(
        { length: numberOfVehicles - currentVehicles.length },
        () => ({
          garageNumber: '',
          amount: undefined,
          owner: ''
        })
      );
      append(vehiclesToAdd);
    } else if (currentVehicles.length > numberOfVehicles) {
      const excessCount = currentVehicles.length - numberOfVehicles;
      for (let i = 0; i < excessCount; i++) {
        remove(currentVehicles.length - 1);
      }
    }
  
    setPhase('vehicleRenters');
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
        <Button size="lg" onClick={() => setOpen(true)}>
          Crear Inquilino
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
  const allSelectedIds = (form.watch('vehicleRenters') ?? [])
  .map((v: any, i: number) => i !== index ? v.owner : null)
  .filter((id: string | null) => id && id !== 'JOSE_RICARDO_AZNAR'||'CARLOS_ALBERTO_AZNAR'||'NIDIA_ROSA_MARIA_FONTELA'||'ADOLFO_RAUL_FONTELA');

  const selectedVehicleIds = form.watch('vehicleRenters')?.map((v: any) => v.owner) ?? [];
  const availableVehicles = getAvailableVehicles(selectedVehicleIds);
  const selectedVehicle = customersRenters.find(v => v.id === selectedVehicleId);
  const manualOwners = [
    'JOSE_RICARDO_AZNAR',
    'CARLOS_ALBERTO_AZNAR',
    'NIDIA_ROSA_MARIA_FONTELA',
    'ADOLFO_RAUL_FONTELA',
  ];
  const isManualOwner = manualOwners.includes(selectedVehicleId || '');

  return (
    <div key={field.id} className="space-y-2">
<FormField
  control={form.control}
  name={`vehicleRenters.${index}.owner`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>¿A qué propietario alquila la cochera?</FormLabel>
      <div>
        <Select
          disabled={isPending}
          value={field.value}
          onValueChange={(value) => {
            field.onChange(value);
            setSelectedVehicleId(value); // ACTUALIZA el valor seleccionado
          }}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar propietario" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {/* Propietarios manuales */}
            <SelectItem value="JOSE_RICARDO_AZNAR">José Ricardo Aznar</SelectItem>
            <SelectItem value="CARLOS_ALBERTO_AZNAR">Carlos Alberto Aznar</SelectItem>
            <SelectItem value="NIDIA_ROSA_MARIA_FONTELA">Nidia Rosa Maria Fontela</SelectItem>
            <SelectItem value="ADOLFO_RAUL_FONTELA">Aldo Raúl Fontela</SelectItem>

            {/* Separador visual */}
            <div className="px-3 py-1 text-xs text-muted-foreground">Vehículos registrados de terceros</div>

            {/* Vehículos disponibles */}
            {availableVehicles
              .filter(vehicle => !allSelectedIds.includes(vehicle.id))
              .map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.customer.firstName} {vehicle.customer.lastName} ({vehicle.garageNumber})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>

{/* MOSTRAR CAMPOS según el tipo de selección */}
{isManualOwner ? (
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
      <p className="pb-5">Cochera: {selectedVehicle.garageNumber}</p>
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
