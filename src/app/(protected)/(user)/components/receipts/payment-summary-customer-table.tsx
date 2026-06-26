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
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MoreHorizontal,
  Printer,
  Receipt as ReceiptIcon,
  Save,
  User,
} from 'lucide-react';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const TZ = 'America/Argentina/Buenos_Aires';

const ars = (n: number | undefined | null) =>
  n != null
    ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(n)
    : '—';

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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedReceiptForPayment, setSelectedReceiptForPayment] =
    useState<Receipt | null>(null);

  const pageSize = 10;
  const { data: session } = useSession();
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(null);

  const toTime = (value?: string | Date | null) => {
    if (!value) return NaN;
    if (value instanceof Date) return value.getTime();
    let d = dayjs(value);
    if (!d.isValid()) d = dayjs.tz(value, TZ);
    return d.isValid() ? d.valueOf() : NaN;
  };

  const sortReceiptsMostRecentFirst = (list: Receipt[]) => {
    return [...list].sort((a, b) => {
      const aStart = toTime(a.startDate ?? null);
      const bStart = toTime(b.startDate ?? null);
      const aStartSafe = isNaN(aStart) ? -Infinity : aStart;
      const bStartSafe = isNaN(bStart) ? -Infinity : bStart;
      if (bStartSafe !== aStartSafe) return bStartSafe - aStartSafe;
      const aTie = toTime(a.paymentDate ?? a.dateNow ?? null);
      const bTie = toTime(b.paymentDate ?? b.dateNow ?? null);
      const aTieSafe = isNaN(aTie) ? -Infinity : aTie;
      const bTieSafe = isNaN(bTie) ? -Infinity : bTie;
      return bTieSafe - aTieSafe;
    });
  };

  useEffect(() => {
    if (autoOpen) {
      setOpen(false);
      setTimeout(() => setOpen(true), 100);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      try {
        const updatedOwner = await getCustomerById(customer.id, session?.token);
        if (updatedOwner) {
          setUpdatedCustomer(updatedOwner);
          const sortedReceipts = sortReceiptsMostRecentFirst(
            updatedOwner.receipts || [],
          );
          setReceipts(sortedReceipts);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error fetching owner receipts:', error);
      }
    });
  }, [open, customer.id, session?.token]);

  const activeCustomer = updatedCustomer || customer;

  const totalPages = Math.ceil(receipts.length / pageSize);
  const paginatedReceipts = receipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function getMonthName(dateString?: string | null): string {
    if (!dateString) return 'Sin fecha';
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const date = dayjs.tz(dateString, TZ);
    if (!date.isValid()) return 'Fecha inválida';
    return meses[date.month()];
  }

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return '—';
    const d = dayjs.tz(dateStr, TZ);
    return d.isValid() ? d.format('DD/MM/YYYY') : '—';
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
        const sortedReceipts = sortReceiptsMostRecentFirst(
          updatedOwner.receipts || [],
        );
        setReceipts(sortedReceipts);
        setCurrentPage(1);
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
        data,
      );

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Pago registrado exitosamente.');
        await refreshReceipts();
      }
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      toast.error('Error al registrar el pago.');
    } finally {
      setOpenPaymentDialog(false);
      setSelectedReceiptForPayment(null);
    }
  };

  function translatePaymentType(type: string) {
    switch (type) {
      case 'TRANSFER': return 'Transferencia';
      case 'CASH':     return 'Efectivo';
      case 'CHECK':    return 'Cheque';
      case 'CREDIT':   return 'Crédito';
      case 'FIX':      return 'Corrección';
      default:         return 'Automático';
    }
  }

  function paymentTypeBadgeVariant(type: string) {
    switch (type) {
      case 'TRANSFER': return 'blue' as const;
      case 'CASH':     return 'green' as const;
      case 'CHECK':    return 'orange' as const;
      case 'CREDIT':   return 'yellow' as const;
      case 'FIX':      return 'red' as const;
      default:         return 'default' as const;
    }
  }

  const paidCount = receipts.filter((r) => r.status === 'PAID').length;
  const pendingCount = receipts.filter((r) => r.status === 'PENDING').length;
  const initials =
    `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase() ||
    'GM';

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span
            className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer text-[12.5px] transition-colors"
            onClick={() => setOpen(true)}
          >
            {children || 'Ver Resumen'}
          </span>
        </DialogTrigger>

        <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-6xl [&>div]:gap-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-gm-orange text-white font-display font-bold text-base">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle>
                  Resumen de {customer.firstName} {customer.lastName}
                </DialogTitle>
                <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-3 text-[12.5px]">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-3.5" />
                    {customer.customerType === 'OWNER'
                      ? 'Propietario'
                      : customer.customerType === 'PRIVATE'
                      ? 'Inquilino de terceros'
                      : 'Inquilino'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ReceiptIcon className="size-3.5" /> {receipts.length} recibos
                  </span>
                </DialogDescription>
              </div>
              {isPending && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </DialogHeader>

          {/* Quick facts */}
          <dl className="grid grid-cols-3 gap-2">
            <Fact label="Pagados" value={paidCount.toString()} accent="green" />
            <Fact label="Pendientes" value={pendingCount.toString()} accent={pendingCount > 0 ? 'orange' : 'green'} />
            <Fact label="Crédito" value={ars(activeCustomer.credit ?? 0)} accent="yellow" />
          </dl>

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha de pago</TableHead>
                  <TableHead>Método/s</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Imprimir</TableHead>
                  <TableHead className="text-center">Cancelar</TableHead>
                  <TableHead className="text-center">Registrar</TableHead>
                  <TableHead className="text-center">Movimientos</TableHead>
                  <TableHead className="w-[1%]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedReceipts.length > 0 ? (
                  paginatedReceipts.map((receiptOwner) => (
                    <TableRow key={receiptOwner.id}>
                      <TableCell>
                        <Badge
                          variant={
                            receiptOwner.status === 'PAID' ? 'green' : 'orange'
                          }
                        >
                          {receiptOwner.status === 'PAID' ? (
                            <>
                              <BadgeCheck className="size-3" /> Pagado
                            </>
                          ) : (
                            <>
                              <Clock className="size-3" /> Pendiente
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-[13px]">
                        {getMonthName(receiptOwner.startDate)}
                      </TableCell>

                      <TableCell className="text-[13px] gm-mono text-muted-foreground">
                        {formatDate(receiptOwner.paymentDate)}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {receiptOwner.payments?.length
                            ? receiptOwner.payments.map((p, i) => (
                                <Badge
                                  key={i}
                                  variant={paymentTypeBadgeVariant(p.paymentType)}
                                >
                                  {translatePaymentType(p.paymentType)}
                                </Badge>
                              ))
                            : receiptOwner.paymentHistoryOnAccount?.length
                            ? receiptOwner.paymentHistoryOnAccount.map((p, i) => (
                                <Badge
                                  key={i}
                                  variant={paymentTypeBadgeVariant(p.paymentType)}
                                >
                                  {translatePaymentType(p.paymentType)}
                                </Badge>
                              ))
                            : receiptOwner.paymentType
                            ? (
                                <Badge variant={paymentTypeBadgeVariant(receiptOwner.paymentType)}>
                                  {translatePaymentType(receiptOwner.paymentType)}
                                </Badge>
                              )
                            : null}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="gm-display gm-tnum text-[14px] font-bold">
                          {ars(
                            receiptOwner.price && receiptOwner.price > 0
                              ? receiptOwner.price
                              : receiptOwner.startAmount,
                          )}
                        </span>
                      </TableCell>

                      {/* Imprimir */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handlePrint(receiptOwner)}
                        >
                          <Printer className="size-3.5" />
                        </Button>
                      </TableCell>

                      {/* Cancelar */}
                      <TableCell className="text-center">
                        <Dialog
                          open={openCancelDialog && selectedReceiptId === receiptOwner.id}
                          onOpenChange={(v) => {
                            if (!v) setOpenCancelDialog(false);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-[#F08775]"
                              onClick={() => {
                                setSelectedReceiptId(receiptOwner.id);
                                setOpenCancelDialog(true);
                              }}
                            >
                              <Ban className="size-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <div className="flex items-center gap-3">
                                <span className="grid size-9 place-items-center rounded-md border border-destructive/40 bg-destructive/15 text-[#F08775]">
                                  <Ban className="size-4" />
                                </span>
                                <div>
                                  <DialogTitle>¿Cancelar recibo?</DialogTitle>
                                  <DialogDescription className="mt-0.5">
                                    Se marcará como pendiente y se eliminará de la
                                    planilla de caja. Si se pagó con crédito, el monto
                                    será reintegrado.
                                  </DialogDescription>
                                </div>
                              </div>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="ghost"
                                onClick={() => setOpenCancelDialog(false)}
                              >
                                Volver
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  if (!selectedReceiptId) return;
                                  const result = await cancelReceiptAction(
                                    selectedReceiptId,
                                    customer.id,
                                  );
                                  if (result.error)
                                    toast.error(result.error.message);
                                  else {
                                    toast.success('Recibo cancelado exitosamente');
                                    await refreshReceipts();
                                  }
                                  setOpenCancelDialog(false);
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
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRegister(receiptOwner)}
                        >
                          <Save className="size-3.5" />
                        </Button>
                      </TableCell>

                      {/* Movimientos */}
                      <TableCell className="text-center">
                        <ReceiptMovementsDrawer receipt={receiptOwner} />
                      </TableCell>

                      {/* Más acciones */}
                      <TableCell>
                        <DropdownMenu
                            open={openDropdownId === receiptOwner.id}
                            onOpenChange={(v) =>
                              setOpenDropdownId(v ? receiptOwner.id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-sm">
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
                    <TableCell colSpan={10} className="h-24 text-center">
                      <div className="text-[13px] text-muted-foreground">
                        No hay recibos registrados.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-muted-foreground gm-mono">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentTypeReceiptDialog
        open={openPaymentDialog}
        onConfirm={handleConfirmPayment}
        onClose={() => setOpenPaymentDialog(false)}
        receipt={selectedReceiptForPayment ?? undefined}
        customer={customer}
        customerType={customer.customerType}
      />
    </>
  );
}

function Fact({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'yellow' | 'orange' | 'green';
}) {
  const c =
    accent === 'yellow'
      ? 'text-gm-yellow'
      : accent === 'orange'
      ? 'text-[#FF8458]'
      : accent === 'green'
      ? 'text-[#9AD588]'
      : 'text-foreground';
  return (
    <div className="rounded-md border border-border bg-gm-surface-2 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className={`gm-display gm-tnum mt-1 text-[20px] font-bold ${c}`}>
        {value}
      </dd>
    </div>
  );
}
