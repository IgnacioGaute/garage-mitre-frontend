'use client';

import { useState, useTransition, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { BadgeCheck, Clock, ArrowUp, Printer, Ban, Save } from 'lucide-react';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { generateReceiptsWithoutRegistering } from '@/utils/generate-receipt-without-registering';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cancelReceiptAction } from '@/actions/receipts/cancel-receipt.action';
import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { historialReceiptsAction } from '@/actions/receipts/create-receipt.action';
import { PaymentTypeReceiptDialog } from './payment-type-receipt-dialog';
import { Receipt } from '@/types/receipt.type';
import { ReceiptMovementsDrawer } from './receipt-movements-drower';

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
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<ReceiptSchemaType['payments']>([
    { paymentType: 'CASH' },
  ]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // NUEVO: diálogo para confirmar pago
  const [selectedReceiptForPayment, setSelectedReceiptForPayment] = useState<Receipt | null>(null);
  const [paymentData, setPaymentData] = useState<ReceiptSchemaType | null>(null);



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
              const dateA = a.dateNow ? Date.parse(a.dateNow) : 0;
              const dateB = b.dateNow ? Date.parse(b.dateNow) : 0;
              if (isNaN(dateA) && isNaN(dateB)) return 0;
              if (isNaN(dateA)) return 1;
              if (isNaN(dateB)) return -1;

              return dateA - dateB;
            });

            setReceipts(sortedReceipts);

            const newTotalPages = Math.ceil(sortedReceipts.length / pageSize);
            setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
          }
        } catch (error) {
          console.error('Error fetching owner receipts:', error);
        }
      });
    }
  }, [open, customer.id]);

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

    const date = dayjs.tz(dateString, 'America/Argentina/Buenos_Aires');
    if (!date.isValid()) return 'Fecha inválida';

    return meses[date.month()];
  }

  const handlePrint = async (receiptOwner: typeof receipts[0]) => {
    try {
      await generateReceiptsWithoutRegistering(activeCustomer, receiptOwner);
    } catch (err) {
      console.error('Error al generar el recibo para imprimir:', err);
    }
  };

  const refreshReceipts = async () => {
    try {
      const updatedOwner = await getCustomerById(customer.id, session?.token);
      if (updatedOwner) {
        setUpdatedCustomer(updatedOwner);

        const sortedReceipts = (updatedOwner.receipts || []).sort((a, b) => {
          const dateA = a.dateNow ? Date.parse(a.dateNow) : 0;
          const dateB = b.dateNow ? Date.parse(b.dateNow) : 0;
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateA - dateB;
        });

        setReceipts(sortedReceipts);
        const newTotalPages = Math.ceil(sortedReceipts.length / pageSize);
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
      }
    } catch (error) {
      console.error('Error actualizando recibos:', error);
    }
  };

    const handleRegister = (receipt: Receipt) => {
      setSelectedReceiptForPayment(receipt);
      setOpenPaymentDialog(true);
    };

    const handleConfirmPayment = async (data: ReceiptSchemaType) => {
      setPaymentData(data); // guardás todo el objeto, no solo los payments
      setOpenPaymentDialog(false);
      setOpenConfirmDialog(true);
    };

  const handleConfirm = async () => {
    if (!selectedPayments) return;

    try {
      const updatedCustomer = await getCustomerById(customer.id, session?.token);

      if (!updatedCustomer) {
        toast.error("No se pudieron obtener los datos actualizados del cliente.");
        return;
      }
      if (!paymentData) return;
      const result = await historialReceiptsAction(
        selectedReceiptForPayment?.id || "",
        customer.id,
        paymentData // ✅ ahora pasás todo ReceiptSchemaType
      );
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Pago registrado exitosamente.");
        await refreshReceipts();
        setOpenConfirmDialog(false);
      }

    } catch (error) {
      console.error("Error al registrar el pago:", error);
      toast.error("Error al registrar el pago.");
    } finally {
      setSelectedPayments([{ paymentType: 'CASH' }]);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="text-gray-500 hover:underline cursor-pointer" onClick={() => setOpen(true)}>
            {children || 'Ver Resumen'}
          </span>
        </DialogTrigger>

        <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-6xl">

          <DialogHeader className="items-center">
            <DialogTitle>Resumen de Recibos pagados y pendientes de {customer.firstName} {customer.lastName}</DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Estado</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Metodo/s de Pago</TableHead>
                <TableHead className="text-right pr-12">Monto</TableHead>
                <TableHead>Imprimir</TableHead>
                <TableHead>Cancelar</TableHead>
                <TableHead>Registrar</TableHead>
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
                          {receiptOwner.payments && receiptOwner.payments.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {receiptOwner.payments.map((payment, index) => (
                                <span key={index}>
                                  {payment.paymentType === 'TRANSFER'
                                    ? 'Transferencia'
                                    : payment.paymentType === 'CASH'
                                    ? 'Efectivo'
                                    : payment.paymentType === 'CHECK'
                                    ? 'Cheque'
                                    : 'Desconocido'}
                                </span>
                              ))}
                            </div>
                          ) : receiptOwner.paymentHistoryOnAccount &&
                            receiptOwner.paymentHistoryOnAccount.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {receiptOwner.paymentHistoryOnAccount.map((payment, index) => (
                                <span key={index}>
                                  {payment.paymentType === 'TRANSFER'
                                    ? 'Transferencia'
                                    : payment.paymentType === 'CASH'
                                    ? 'Efectivo'
                                    : payment.paymentType === 'CHECK'
                                    ? 'Cheque'
                                    : 'Desconocido'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span>Sin pagos</span>
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

                    <TableCell className="text-center">

                      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReceiptId(receiptOwner.id);
                              setOpenCancelDialog(true);
                            }}
                          >
                            <Ban className="w-5 h-5 text-red-500 hover:text-red-700" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Está seguro?</DialogTitle>
                            <DialogDescription>Este recibo se marcará como "pendiente" y se eliminara de la planilla de caja.</DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenCancelDialog(false)}>Cancelar</Button>
                            <Button
                              onClick={async () => {
                                if (!selectedReceiptId) return;
                                const result = await cancelReceiptAction(selectedReceiptId, customer.id);
                                if (result.error) {
                                  toast.error(result.error.message);
                                } else {
                                  toast.success('Recibo cancelado exitosamente');
                                  await refreshReceipts();
                                }
                                setOpenCancelDialog(false);
                                setOpenDropdown(false);
                              }}

                            >

                              Cancelar Recibo
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegister(receiptOwner)}
                      >
                        <Save className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <ReceiptMovementsDrawer receipt={receiptOwner} />
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

      {/* Diálogo para seleccionar tipo de pago */}
      <PaymentTypeReceiptDialog
        open={openPaymentDialog}
        onConfirm={handleConfirmPayment}
        onClose={() => setOpenPaymentDialog(false)}
        receipt={selectedReceiptForPayment ?? undefined}
      />

      {/* NUEVO diálogo para confirmar pago */}
      <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogDescription>¿Deseas registrar este pago?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
