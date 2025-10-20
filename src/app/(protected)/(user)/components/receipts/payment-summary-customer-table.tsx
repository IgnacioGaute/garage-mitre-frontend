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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCustomerById } from '@/services/customers.service';
import {
  BadgeCheck,
  Clock,
  Printer,
  Ban,
  Save,
  MoreHorizontal,
} from 'lucide-react';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { generateReceiptsWithoutRegistering } from '@/utils/generate-receipt-without-registering';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cancelReceiptAction } from '@/actions/receipts/cancel-receipt.action';
import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { historialReceiptsAction } from '@/actions/receipts/create-receipt.action';
import { PaymentTypeReceiptDialog } from './payment-type-receipt-dialog';
import { Receipt } from '@/types/receipt.type';
import { ReceiptMovementsDrawer } from './receipt-movements-drower';
import { DeleteReceiptDialog } from './delete-receipt-dialog';

dayjs.extend(utc);
dayjs.extend(timezone);

interface PaymentSummaryTableProps {
  customer: Customer;
  children?: ReactNode;
  autoOpen?: boolean;
}

export function PaymentSummaryTable({
  customer,
  children,
  autoOpen,
}: PaymentSummaryTableProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [receipts, setReceipts] = useState(customer.receipts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [selectedPayments, setSelectedPayments] = useState<
    ReceiptSchemaType['payments']
  >([{ paymentType: 'CASH' }]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedReceiptForPayment, setSelectedReceiptForPayment] =
    useState<Receipt | null>(null);
  const pageSize = 10;
  const { data: session } = useSession();
  const totalPages = Math.ceil(receipts.length / pageSize);
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (autoOpen) {
      setOpen(false);
      setTimeout(() => setOpen(true), 100);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        try {
          const updatedOwner = await getCustomerById(
            customer.id,
            session?.token
          );
          if (updatedOwner) {
            setUpdatedCustomer(updatedOwner);
            const sortedReceipts = (updatedOwner.receipts || []).sort(
              (a, b) => {
                const dateA = a.dateNow ? Date.parse(a.dateNow) : 0;
                const dateB = b.dateNow ? Date.parse(b.dateNow) : 0;
                if (isNaN(dateA) && isNaN(dateB)) return 0;
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                return dateA - dateB;
              }
            );
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
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const date = dayjs.tz(dateString, 'America/Argentina/Buenos_Aires');
    if (!date.isValid()) return 'Fecha inválida';
    return meses[date.month()];
  }

  const handlePrint = async (receiptOwner: Receipt) => {
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
    try {
      const result = await historialReceiptsAction(
        selectedReceiptForPayment?.id || '',
        customer.id,
        data
      );
  
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('✅ Pago registrado exitosamente.');
        await refreshReceipts();
      }
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      toast.error('❌ Error al registrar el pago.');
    } finally {
      setOpenPaymentDialog(false); // 🔸 cerrar el modal
      setSelectedReceiptForPayment(null);
    }
  };
  

  function translatePaymentType(type: string) {
    switch (type) {
      case 'TRANSFER':
        return 'Transferencia';
      case 'CASH':
        return 'Efectivo';
      case 'CHECK':
        return 'Cheque';
      case 'CREDIT':
        return 'Crédito';
      default:
        return 'Desconocido';
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span
            className="text-gray-500 hover:underline cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {children || 'Ver Resumen'}
          </span>
        </DialogTrigger>

        <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-6xl">
          <DialogHeader className="items-center">
            <DialogTitle>
              Resumen de Recibos pagados y pendientes de{' '}
              {customer.firstName} {customer.lastName}
            </DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Estado</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Método/s de Pago</TableHead>
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
                    {/* Estado */}
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {receiptOwner.status === 'PAID' ? (
                          <BadgeCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <span>
                          {receiptOwner.status === 'PAID'
                            ? 'Pagado'
                            : 'Pendiente'}
                        </span>
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

                    {/* Métodos de pago */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        {receiptOwner.payments?.length
                          ? receiptOwner.payments.map((p, i) => (
                              <span key={i}>
                                {translatePaymentType(p.paymentType)}
                              </span>
                            ))
                          : receiptOwner.paymentHistoryOnAccount?.length
                          ? receiptOwner.paymentHistoryOnAccount.map((p, i) => (
                              <span key={i}>
                                {translatePaymentType(p.paymentType)}
                              </span>
                            ))
                          : receiptOwner.paymentType
                          ? translatePaymentType(receiptOwner.paymentType)
                          : 'Sin pagos'}
                      </div>
                    </TableCell>

                    {/* Monto */}
                    <TableCell className="text-right pr-6 align-middle">
                      <span className="block pr-5">${receiptOwner.price}</span>
                    </TableCell>

                    {/* Imprimir */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrint(receiptOwner)}
                      >
                        <Printer className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                      </Button>
                    </TableCell>

                    {/* Cancelar */}
                    <TableCell className="text-center">
                      <Dialog
                        open={openCancelDialog}
                        onOpenChange={setOpenCancelDialog}
                      >
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
                            <DialogDescription>
                              Este recibo se marcará como "pendiente" y se
                              eliminará de la planilla de caja. Si se pagó con
                              crédito, el monto será reintegrado.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setOpenCancelDialog(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={async () => {
                                if (!selectedReceiptId) return;
                                const result = await cancelReceiptAction(
                                  selectedReceiptId,
                                  customer.id
                                );
                                if (result.error) {
                                  toast.error(result.error.message);
                                } else {
                                  toast.success(
                                    'Recibo cancelado exitosamente'
                                  );
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

                    {/* Registrar */}
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

                    <TableCell>
                      <DropdownMenu
                        open={openDropdownId === receiptOwner.id}
                        onOpenChange={(open) =>
                          setOpenDropdownId(open ? receiptOwner.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-sm sm:text-base">
                            Acciones
                          </DropdownMenuLabel>
                          <DeleteReceiptDialog receipt={receiptOwner} />
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </DialogContent>
      </Dialog>

      {/* Modal de pago */}
      <PaymentTypeReceiptDialog
        open={openPaymentDialog}
        onConfirm={handleConfirmPayment}
        onClose={() => setOpenPaymentDialog(false)}
        receipt={selectedReceiptForPayment ?? undefined}
        customer={customer}
      />
    </>
  );
}
