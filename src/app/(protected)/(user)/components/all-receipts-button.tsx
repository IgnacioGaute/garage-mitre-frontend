"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateAllReceipts } from "@/utils/generate-all-receipts"; // Asume que la lógica está en un archivo aparte

type GenerateReceiptsButtonProps = {
  customers: any[];
};

export default function GenerateReceiptsButton({ customers }: GenerateReceiptsButtonProps) {
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
    }
  };

  return (
    <Button
    variant="ghost"
    className="w-full justify-start"
    size="sm"
    onClick={handleGenerateAllReceipts}
  >
    Generar Recibos
  </Button>
  );
}
