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
import { BadgeCheck, Clock, ArrowUp, Printer } from 'lucide-react';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { generateReceiptsWithoutRegistering } from '@/utils/generate-receipt-without-registering';

dayjs.extend(utc);
dayjs.extend(timezone);

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
          setUpdatedCustomer(updatedOwner);

const sortedReceipts = (updatedOwner.receipts || []).sort((a, b) => {
  const dateA = a.dateNow ? Date.parse(a.dateNow) : 0; // Date.parse devuelve ms o NaN
  const dateB = b.dateNow ? Date.parse(b.dateNow) : 0;

  // Si alguna fecha es inválida, ponla al final
  if (isNaN(dateA) && isNaN(dateB)) return 0;
  if (isNaN(dateA)) return 1;
  if (isNaN(dateB)) return -1;

  return dateA - dateB;
});




          setReceipts(sortedReceipts);

          // ✅ Al abrir el modal, ir a la última página
          const newTotalPages = Math.ceil(sortedReceipts.length / pageSize);
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


function getMonthName(dateString?: string | null): string {
  if (!dateString) return 'Sin fecha';

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Parseamos la fecha en la zona horaria de Argentina para evitar el problema UTC
  const date = dayjs.tz(dateString, 'America/Argentina/Buenos_Aires');
  if (!date.isValid()) return 'Fecha inválida';

  return meses[date.month()];
}

  const handlePrint = async (receiptOwner: typeof receipts[0]) => {
    // Aquí llamamos a tu función de generación de recibo, pasándole el cliente y el recibo
    try {
      await generateReceiptsWithoutRegistering(activeCustomer, receiptOwner);
    } catch (err) {
      console.error('Error al generar el recibo para imprimir:', err);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-gray-500 hover:underline cursor-pointer" onClick={() => setOpen(true)}>
          {children || 'Ver Resumen'}
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-2xl sm:max-w-2xl">
        <DialogHeader className="items-center">
          <DialogTitle>Resumen de Recibos pagados y pendientes de {customer.firstName} {customer.lastName}</DialogTitle>
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
<TableCell className="font-medium">
  <div className="flex items-center space-x-2">
    {receiptOwner.status === 'PAID' ? (
      <BadgeCheck className="h-5 w-5 text-green-500" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-500" />
    )}
    <span>{receiptOwner.status === 'PAID' ? 'Pagado' : 'Pendiente'}</span>
  </div>
</TableCell>

<TableCell>{getMonthName(receiptOwner.startDate)}</TableCell>



                  <TableCell>
                    {receiptOwner.paymentDate &&
                      new Date(
                        new Date(receiptOwner.paymentDate).getTime() +
                          new Date().getTimezoneOffset() * 60000
                      ).toLocaleDateString()}
                  </TableCell>
<TableCell className="font-medium">
  <div className="flex items-center space-x-2">
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
  </div>
</TableCell>

<TableCell className="text-right pr-6 align-middle">
  <span className="block pr-5">${receiptOwner.price}</span>
</TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handlePrint(receiptOwner)}
                    >
                      <Printer className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                    </Button>
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
