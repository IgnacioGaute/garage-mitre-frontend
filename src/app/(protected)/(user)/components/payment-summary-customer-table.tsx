'use client';

import { useState, useTransition, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCustomerById } from '@/services/customers.service';
import { BadgeCheck, Clock, ArrowUp } from 'lucide-react';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface PaymentSummaryTableProps {
  customer: Customer;
  children?: ReactNode;
  autoOpen? : boolean
}

export function PaymentSummaryTable({ customer, children, autoOpen }: PaymentSummaryTableProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [receipts, setReceipts] = useState(customer.receipts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: session } = useSession();

  const totalPages = Math.ceil(receipts.length / pageSize);

  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (autoOpen) {
      setOpen(false); // Reinicia
      setTimeout(() => setOpen(true), 100); // Reabre después de un delay
    }
  }, [autoOpen]);
  

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        try {
          const updatedOwner = await getCustomerById(customer.id, session?.token);
          if (updatedOwner) {
            setUpdatedCustomer(updatedOwner); // ✅ Guardamos el customer actualizado
            setReceipts(updatedOwner.receipts || []);
  
            // ✅ Al abrir el modal, se va a la última página
            const newTotalPages = Math.ceil(updatedOwner.receipts.length / pageSize);
            setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
          }
        } catch (error) {
          console.error('Error fetching owner receipts:', error);
        }
      });
    }
  }, [open, customer.id]);
  
  // Usamos `updatedCustomer` si está disponible, de lo contrario usamos `customer`
  const activeCustomer = updatedCustomer || customer;

  const paginatedReceipts = receipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-gray-500 hover:underline cursor-pointer" onClick={() => setOpen(true)}>
          {children || 'Ver Resumen'}
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-2xl sm:max-w-2xl">
        <DialogHeader className="items-center">
          <DialogTitle>Resumen de Pagos Recientes de {customer.firstName} {customer.lastName}</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Estado</TableHead>
              <TableHead>Fecha de Inicio</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead>Metodo de Pago</TableHead>
              <TableHead className="text-right pr-12">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReceipts.length > 0 ? (
              paginatedReceipts.map((receiptOwner) => (
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
                    {receiptOwner.status === 'PENDING'
                    ? activeCustomer.startDate
                      ? new Date(
                          new Date(activeCustomer.startDate).getTime() +
                            new Date().getTimezoneOffset() * 60000
                        ).toLocaleDateString()
                      : 'Sin fecha'
                    : activeCustomer.previusStartDate
                    ? new Date(
                        new Date(activeCustomer.previusStartDate).getTime() +
                          new Date().getTimezoneOffset() * 60000
                      ).toLocaleDateString()
                    : 'Sin fecha'}
                </TableCell>


                  <TableCell>
                    {receiptOwner.paymentDate &&
                      new Date(
                        new Date(receiptOwner.paymentDate).getTime() +
                          new Date().getTimezoneOffset() * 60000
                      ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium flex items-center space-x-2">
                    {receiptOwner.paymentType && (
                      <span>
                      {receiptOwner.paymentType === 'TRANSFER'
                        ? 'Transferencia'
                        : receiptOwner.paymentType === 'CASH'
                        ? 'Efectivo'
                        : receiptOwner.paymentType === 'CHECK'
                        ? 'Cheque'
                        : 'Desconocido'}
                    </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right relative pr-6">
                    <span className="block pr-5">${receiptOwner.price}</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ✅ Controles de paginación */}
        {receipts.length > pageSize && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
