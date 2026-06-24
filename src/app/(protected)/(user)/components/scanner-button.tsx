'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import { startScanner } from '@/services/scanner.service';
import { toast } from 'sonner';
import { getCustomerById } from '@/services/customers.service';
import { historialReceiptsAction } from '@/actions/receipts/create-receipt.action';
import { useSession } from 'next-auth/react';
import { OpenScannerDialog } from './open-scanner-dialog';
import { Customer } from '@/types/cutomer.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { Receipt } from '@/types/receipt.type';
import { Camera, Hash, Keyboard, Loader2, ScanLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScannerButton({ isDialogOpen }: { isDialogOpen: boolean }) {
  const [isScanning, setIsScanning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const session = useSession();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [barCode, setBarCode] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualBarCode, setManualBarCode] = useState('');

  useEffect(() => {
    const handleKeyDown = () => {
      const dialogIsOpen = isDialogOpen || dialogOpen || manualInputVisible;
      if (!dialogIsOpen && !isScanning) {
        setIsScanning(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    const handleKeyUp = () => setIsScanning(false);

    const dialogIsOpen = isDialogOpen || dialogOpen || manualInputVisible;
    if (!dialogIsOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDialogOpen, dialogOpen, manualInputVisible, isScanning]);

  const handleSubmit = async (code: string) => {
    if (!code) return;
    startTransition(() => {
      startScanner({ barCode: code })
        .then(async (data) => {
          if (!data || 'error' in data) {
            toast.error(data?.error || 'Error desconocido');
          } else {
            if (data.type === 'RECEIPT') {
              toast.success('🧾 Recibo detectado', { duration: 5000 });
              setCustomerId(data.id);
              setBarCode(data.barcode);
              setReceipt(data.receipt);
              setReceiptId(data.receiptId || '');
              try {
                const fetchedCustomer = await getCustomerById(data.id || '', session.data?.token);
                if (!fetchedCustomer) {
                  toast.error('No se encontró el cliente.');
                  return;
                }
                setCustomer(fetchedCustomer);
                setDialogOpen(true);
              } catch (err) {
                console.error('Error al obtener cliente:', err);
                toast.error('Error al obtener los datos del cliente.');
              }
            } else {
              toast.success('🎫 Ticket detectado', { duration: 3000 });
              setTimeout(() => window.location.reload(), 1000);
            }
          }
          setIsScanning(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Error en la solicitud.');
          setIsScanning(false);
        });
    });
  };

  const handleConfirm = async (data: ReceiptSchemaType) => {
    if (!data?.payments || !customerId) return;
    try {
      const updatedCustomer = await getCustomerById(customerId, session.data?.token);
      if (!updatedCustomer) {
        toast.error('No se pudieron obtener los datos actualizados del cliente.');
        return;
      }
      setCustomer(updatedCustomer);

      const fullData: ReceiptSchemaType = { ...data, barcode: barCode || undefined };
      const result = await historialReceiptsAction(receiptId || '', customerId, fullData);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      toast.success('Pago registrado exitosamente.', { duration: 5000 });
      setDialogOpen(false);
    } catch (err) {
      console.error('Error al registrar el pago:', err);
      toast.error('Error al registrar el pago.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Status indicator */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-full border px-4 py-2 transition-colors',
          isScanning
            ? 'border-gm-orange/40 bg-gm-orange/15 text-[#FF8458]'
            : manualInputVisible
            ? 'border-gm-yellow/40 bg-gm-yellow/15 text-gm-yellow'
            : 'border-border bg-gm-surface-2 text-muted-foreground',
        )}
      >
        {isScanning ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span className="gm-display text-[12px] font-bold tracking-[0.06em]">
              Escaneando…
            </span>
          </>
        ) : manualInputVisible ? (
          <>
            <Keyboard className="size-4" />
            <span className="gm-display text-[12px] font-bold tracking-[0.06em]">
              Ingreso manual activo
            </span>
          </>
        ) : (
          <>
            <Camera className="size-4" />
            <span className="gm-display text-[12px] font-bold tracking-[0.06em]">
              Lector listo — apuntá el código
            </span>
          </>
        )}
      </div>

      {/* Hidden input that captures scan input */}
      {!manualInputVisible && (
        <input
          ref={inputRef}
          type="text"
          autoFocus
          onBlur={() => setIsScanning(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
          className="absolute h-0 w-0 opacity-0 pointer-events-none"
          aria-hidden
        />
      )}

      {/* Manual entry toggle */}
      <button
        onClick={() => setManualInputVisible((p) => !p)}
        className={cn(
          'group relative inline-flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300',
          manualInputVisible
            ? 'border-border/60 bg-gm-surface-2/80 text-muted-foreground hover:bg-gm-surface-3'
            : 'border-border/50 bg-card/30 text-foreground hover:border-gm-orange/40 hover:bg-gm-orange/10 hover:shadow-[0_0_30px_-8px_hsl(var(--gm-orange)/0.3)]',
        )}
      >
        {manualInputVisible ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
              <X className="size-4" />
            </span>
            Cancelar ingreso manual
          </>
        ) : (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gm-orange/30 bg-gm-orange/15 text-gm-orange transition-colors group-hover:bg-gm-orange/25">
              <Keyboard className="size-4" />
            </span>
            Ingresar código manualmente
          </>
        )}
      </button>

      {/* Manual entry form */}
      {manualInputVisible && (
        <div className="w-full max-w-md space-y-2">
          <Label>Código de recibo o ticket</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={manualBarCode}
                onChange={(e) => setManualBarCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(manualBarCode);
                    setManualBarCode('');
                    setManualInputVisible(false);
                  }
                }}
                placeholder="Pegá o tipeá el código…"
                className="pl-9 gm-mono tracking-[0.04em]"
              />
            </div>
            <Button
              onClick={() => {
                handleSubmit(manualBarCode);
                setManualBarCode('');
                setManualInputVisible(false);
              }}
              disabled={!manualBarCode}
            >
              <ScanLine className="size-4" />
              Confirmar
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Apretá <kbd className="gm-kbd">Enter</kbd> para procesar.
          </p>
        </div>
      )}

      <OpenScannerDialog
        open={dialogOpen}
        onConfirm={handleConfirm}
        onClose={() => setDialogOpen(false)}
        customer={customer}
        receipt={receipt}
        customerType={customer?.customerType}
      />
    </div>
  );
}
