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
      onClick={handleGenerateAllReceipts}
      className="bg-primary text-white hover:bg-primary/90"
    >
      Generar Recibos para Todos
    </Button>
  );
}
