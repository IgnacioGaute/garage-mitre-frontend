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
import { Renter } from '@/types/renter.type';
import { renterSchema, UpdateRenterSchemaType } from '@/schemas/renter-schema';
import { updateRenterAction } from '@/actions/renters/update-renter.action';

export function UpdateRenterDialog({ renter }: { renter: Renter }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<Partial<UpdateRenterSchemaType>>({
    resolver: zodResolver(renterSchema),
    defaultValues: {
        firstName: renter.firstName,
        lastName: renter.lastName,
        email: renter.email,
        address: renter.address,
        documentNumber: renter.documentNumber,
        numberOfVehicles: renter.numberOfVehicles,
        vehicleLicesePlate: renter.vehicleLicesePlate,
        vehicleBrand: renter.vehicleBrand,
    },
  });

  const onSubmit = (values: Partial<UpdateRenterSchemaType>) => {
    startTransition(() => {
      updateRenterAction(renter.id, values).then((data) => {
        if (!data || data.error) {
          toast.error(data.error);
        } else {
          toast.success('Inquilino editado exitosamente');
          form.reset();
          setOpen(false);
        }
      });
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

      <DialogContent className="space-y-2">
        <DialogHeader className="items-center">
          <DialogTitle>Editar Inquilino</DialogTitle>
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
                                <FormField
                  control={form.control}
                  name="numberOfVehicles"
                  render={({ field }) => (
                    <FormItem className="flex items-center"> 
                      <FormLabel className="w-1/2 text-left leading-tight">Número de <br /> vehiculos</FormLabel>
                      <div className="w-full space-y-2">
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          placeholder="Escriba número de vehiculos"
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
              name="vehicleLicesePlate"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                    Patetne de vehiculo
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Patente"
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
              name="vehicleBrand"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormLabel className="w-1/2 text-left">
                    Marca vehiculo
                  </FormLabel>
                  <div className="w-full space-y-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Escriba Modelo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
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
                Editar Inquilino
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
