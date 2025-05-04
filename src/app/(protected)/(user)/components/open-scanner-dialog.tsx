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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receiptSchema, ReceiptSchemaType } from '@/schemas/receipt.schema';
import { Customer } from '@/types/cutomer.type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

interface OpenScannerDialogProps {
  open: boolean;
  onConfirm: (paymentType: "TRANSFER" | "CASH" | 'CHECK') => Promise<void>;
  onClose: () => void;
  customer?: Customer;
}

export function OpenScannerDialog({ open, onConfirm, onClose, customer }: OpenScannerDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ReceiptSchemaType>({
    resolver: zodResolver(receiptSchema),
    defaultValues: { paymentType: 'TRANSFER' },
  });

  const handleSubmit = async (data: ReceiptSchemaType) => {
    setIsPending(true);
    await onConfirm(data.paymentType);
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>Elegir Tipo de Pago Para: </DialogTitle>
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
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pago</FormLabel>
                  <FormControl>
                    <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Efectivo</SelectItem>
                        <SelectItem value="TRANSFER">Transferencia</SelectItem>
                        <SelectItem value="CHECK">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isPending}>
              Aceptar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
