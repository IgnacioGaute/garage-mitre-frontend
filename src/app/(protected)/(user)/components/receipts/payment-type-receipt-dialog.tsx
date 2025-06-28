import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receiptSchema, ReceiptSchemaType } from '@/schemas/receipt.schema';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Receipt } from '@/types/receipt.type';

const PAYMENT_TYPE = ['TRANSFER', 'CASH', 'CHECK'] as const;

interface PaymentTypeReceiptDialogProps {
  open: boolean;
  onConfirm: (data: ReceiptSchemaType) => Promise<void>;
  onClose: () => void;
  receipt?: Receipt;
}

export function PaymentTypeReceiptDialog({ open, onConfirm, onClose, receipt  }: PaymentTypeReceiptDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ReceiptSchemaType>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      payments: [{ paymentType: 'TRANSFER', price: undefined }],
      print: false,
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
              {receipt.paymentHistoryOnAccount.length > 0 && (
              <p><strong>Monto Restante:</strong> ${receipt.price}</p>
              )}
            </div>
          )}
        </DialogHeader>

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
                            <SelectItem value="TRANSFER">Transferencia</SelectItem>
                            <SelectItem value="CASH">Efectivo</SelectItem>
                            <SelectItem value="CHECK">Cheque</SelectItem>
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
