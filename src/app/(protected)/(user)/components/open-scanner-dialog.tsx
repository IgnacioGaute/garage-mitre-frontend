import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receiptSchema, ReceiptSchemaType } from '@/schemas/receipt.schema';
import { Customer } from '@/types/cutomer.type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Receipt } from '@/types/receipt.type';

const PAYMENT_TYPE = ['TRANSFER', 'CASH', 'CHECK'] as const;

interface OpenScannerDialogProps {
  open: boolean;
  onConfirm: (data: ReceiptSchemaType) => Promise<void>;
  onClose: () => void;
  customer?: Customer;
  receipt?: Receipt;
}

export function OpenScannerDialog({ open, onConfirm, onClose, customer, receipt }: OpenScannerDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ReceiptSchemaType>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      payments: [{ paymentType: 'TRANSFER', price: undefined }],
      print: false,
      barcode: '',
      onAccount: false
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payments'
  });

  const handleSubmit = async (data: ReceiptSchemaType) => {
    setIsPending(true);
    await onConfirm(data);
    setIsPending(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar forma(s) de pago</DialogTitle>
          {receipt && (
            <div className="mb-4 p-2 border rounded text-sm">
              <p><strong>Recibo Nº:</strong> {receipt.receiptNumber}</p>
              <p><strong>Estado:</strong> {receipt.status === 'PAID' ? 'Pagado' : 'Pendiente'}</p>
              <p><strong>Monto:</strong> ${receipt.startAmount}</p>
              {receipt.paymentHistoryOnAccount && (
              <p><strong>Monto Restante:</strong> ${receipt.price}</p>
              )}
            </div>
          )}
        </DialogHeader>
        <Card>
          <CardContent className="p-4 space-y-3 text-sm sm:text-base">
            <p><strong>Nombre y Apellido:</strong> {customer?.firstName} {customer?.lastName}</p>
            <p><strong>Celular:</strong> {customer?.phone}</p>
            <p><strong>Número de Vehículos:</strong> {customer?.numberOfVehicles}</p>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="onAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Es un pago a cuenta?</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isPending}
                      onValueChange={(value) => field.onChange(value === "true")}
                      defaultValue={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`payments.${index}.paymentType`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tipo de pago</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TYPE.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(fields.length > 1 || form.watch('onAccount')) && (
                  <FormField
                    control={form.control}
                    name={`payments.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="$" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {fields.length > 1 && (
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    x
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => append({ paymentType: 'CASH', price: undefined })}>
              Agregar otra forma de pago
            </Button>

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
