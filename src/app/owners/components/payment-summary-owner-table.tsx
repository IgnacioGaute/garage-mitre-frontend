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
import { Owner } from '@/types/owner.type';
import { getOwnerById } from '@/services/owner.service';
import { BadgeCheck, Clock } from 'lucide-react'; // Importamos los íconos

interface PaymentSummaryTableProps {
  owner: Owner;
  children?: ReactNode;
}

export function PaymentSummaryTable({ owner, children }: PaymentSummaryTableProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [receipts, setReceipts] = useState(owner.receipts || []);

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        try {
          const updatedOwner = await getOwnerById(owner.id);
          setReceipts(updatedOwner?.receipts || []);
        } catch (error) {
          console.error("Error fetching owner receipts:", error);
        }
      });
    }
  }, [open, owner.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-gray-500 hover:underline cursor-pointer" onClick={() => setOpen(true)}>
          {children || "Ver Resumen"}
        </span>
      </DialogTrigger>

      <DialogContent className="space-y-2">
        <DialogHeader className="items-center">
          <DialogTitle>Resumen de Pagos</DialogTitle>
        </DialogHeader>

        <Table>
          <TableCaption>Lista de los pagos recientes del propietario.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Estado</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length > 0 ? (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium flex items-center space-x-2">
                    {receipt.status === 'PAID' ? (
                      <BadgeCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>{receipt.status === 'PAID' ? 'Pagado' : 'Pendiente'}</span>
                  </TableCell>
                  <TableCell>
                    {receipt.paymentDate && new Date(receipt.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">20000</TableCell>
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
