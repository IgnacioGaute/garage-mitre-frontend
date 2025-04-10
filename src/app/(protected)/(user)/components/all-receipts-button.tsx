"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateAllReceipts } from "@/utils/generate-all-receipts";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type GenerateReceiptsButtonProps = {
  customers: any[];
};

export default function GenerateReceiptsButton({ customers }: GenerateReceiptsButtonProps) {
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  const handleGenerateAllReceipts = async () => {
    if (!customers || customers.length === 0) {
      toast.error("No hay inquilinos disponibles para generar recibos");
      return;
    }

    try {
      await generateAllReceipts(customers);
      toast.success("Recibos generados e impresos correctamente");
    } catch (error) {
      console.error("Error al generar todos los recibos:", error);
      toast.error("Error al generar los recibos");
    } finally {
      setOpenPrintDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start"
        size="sm"
        onClick={() => setOpenPaymentDialog(true)}
      >
        Generar Recibos
      </Button>

      {/* Diálogo 1: Selección inicial o advertencia */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Deseas continuar?</DialogTitle>
            <DialogDescription>
              Se procederá a generar los recibos para todos los inquilinos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPaymentDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                setOpenPaymentDialog(false);
                setOpenPrintDialog(true); // Abre el segundo diálogo
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo 2: Confirmación final */}
      <Dialog open={openPrintDialog} onOpenChange={setOpenPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmas la generación?</DialogTitle>
            <DialogDescription>
              Esto generará e imprimirá los recibos para todos los Clientes seleccionados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
            <Button onClick={handleGenerateAllReceipts}>Confirmar e Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
