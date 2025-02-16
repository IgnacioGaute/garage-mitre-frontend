'use client';

import { useState, useTransition, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCustomerById } from '@/services/customer.service';
import { BadgeCheck, Clock, ArrowUp } from 'lucide-react'; // Importamos los íconos
import { Customer } from '@/types/cutomer.type';
import { vehicleSchema } from '@/schemas/vehicle.schema';

interface PaymentSummaryTableProps {
  customer: Customer;
  children?: ReactNode;
}

export function PaymentSummaryTable({ customer, children }: PaymentSummaryTableProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [receipts, setReceipts] = useState(customer.receipts || []);

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        try {
          const updatedOwner = await getCustomerById(customer.id);
          setReceipts(updatedOwner?.receipts || []);
        } catch (error) {
          console.error('Error fetching owner receipts:', error);
        }
      });
    }
  }, [open, customer.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-gray-500 hover:underline cursor-pointer" onClick={() => setOpen(true)}>
          {children || 'Ver Resumen'}
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>Resumen de Pagos</DialogTitle>
        </DialogHeader>

        <Table>
          <TableCaption>Lista de los pagos recientes del propietario.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Estado</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead className="text-right pr-12">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length > 0 ? (
              receipts.map((receiptOwner) => (
                <TableRow key={receiptOwner.id}>
                  <TableCell className="font-medium flex items-center space-x-2">
                    {receiptOwner.status === 'PAID' ? (
                      <BadgeCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>{receiptOwner.status === 'PAID' ? 'Pagado' : 'Pendiente'}</span>
                  </TableCell>
                  <TableCell>
                    {receiptOwner.paymentDate &&
                      new Date(
                        new Date(receiptOwner.paymentDate).getTime() + new Date().getTimezoneOffset() * 60000
                      ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right relative pr-6">
  <span className="block pr-5">{receiptOwner.price}</span>
  {receiptOwner.interestPercentage > 0 && (
    <span className="absolute top-[10px] right-[1px] text-xs text-green-500 flex items-center">
      <ArrowUp className="h-3 w-3" />
      <span className="ml-1">{`${receiptOwner.interestPercentage}%`}</span>
    </span>
  )}
</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
