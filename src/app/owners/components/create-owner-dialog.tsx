'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ownerSchema, OwnerSchemaType } from '@/schemas/owner.schema';
import { createOwnerAction } from '@/actions/owners/create-owner.action';

export function CreateOwnerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OwnerSchemaType>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      documentNumber: undefined,
      numberOfVehicles: 1,
      vehicleLicensePlates: [''],
      vehicleBrands: [''],
    },
  });

  useEffect(() => {
    const numVehicles = form.watch('numberOfVehicles');

    if (numVehicles === 2) {
      form.setValue('vehicleLicensePlates', ['', '']);
      form.setValue('vehicleBrands', ['', '']);
    } else {
      form.setValue('vehicleLicensePlates', ['']);
      form.setValue('vehicleBrands', ['']);
    }
  }, [form.watch('numberOfVehicles')]);

  const onSubmit = (values: OwnerSchemaType) => {
    startTransition(() => {
      createOwnerAction(values).then((data) => {
        if (!data || data.error) {
          toast.error(data.error);
        } else {
          toast.success('Propietario creado exitosamente');
          form.reset();
          setOpen(false);
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className= "hover:text-[#fffc34]" size="lg" onClick={() => setOpen(true)}>
          Crear Propietario
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>Crear Propietario</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                    Nombre
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Nombre"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
                        <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                   Apellido
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Apellido"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                    Email
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
                                    <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                    Direccion
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Direccion"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem className="flex items-center"> 
                      <FormLabel className="w-1/2 text-left leading-tight">Número de <br /> documento</FormLabel>
                      <div className="w-full space-y-2">
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          placeholder="Escriba número de documento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
            {/* Número de Vehículos */}
            <FormField
              control={form.control}
              name="numberOfVehicles"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left leading-tight">Número de vehículos</FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        min={1}
                        max={2}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Sección de Vehículos */}
            {form.watch('vehicleLicensePlates').map((_, index) => (
              <div key={index} className="space-y-2">
                {/* Patente */}
                <FormField
                  control={form.control}
                  name={`vehicleLicensePlates.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center">
                      <FormLabel className="w-1/2 text-left">Patente Vehículo {index + 1}</FormLabel>
                      <div className="w-full space-y-2">
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Escriba Patente"
                            value={form.getValues(`vehicleLicensePlates.${index}`)}
                            onChange={(e) => {
                              const updatedPlates = [...form.getValues('vehicleLicensePlates')];
                              updatedPlates[index] = e.target.value;
                              form.setValue('vehicleLicensePlates', updatedPlates);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Marca */}
                <FormField
                  control={form.control}
                  name={`vehicleBrands.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center">
                      <FormLabel className="w-1/2 text-left">Marca Vehículo {index + 1}</FormLabel>
                      <div className="w-full space-y-2">
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Escriba Marca"
                            value={form.getValues(`vehicleBrands.${index}`)}
                            onChange={(e) => {
                              const updatedBrands = [...form.getValues('vehicleBrands')];
                              updatedBrands[index] = e.target.value;
                              form.setValue('vehicleBrands', updatedBrands);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isPending}
              >
                Confirmar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
