// GenerateReceiptsButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generateAllReceipts } from '@/utils/generate-all-receipts'
import { Customer } from '@/types/cutomer.type'

export type GenerateReceiptsButtonProps = {
  customers: Customer[]
  selectedDate?: Date
  onFinish: () => void
}

export default function GenerateReceiptsButton({
  customers,
  selectedDate,
  onFinish,
}: GenerateReceiptsButtonProps) {
  const handleGenerateAllReceipts = async () => {
    if (!customers?.length) {
      toast.error('No hay inquilinos disponibles')
      return
    }
    if (!selectedDate) {
      toast.error('Selecciona una fecha primero')
      return
    }

    try {
      await generateAllReceipts(customers, selectedDate)
      toast.success('Recibos generados e impresos correctamente')
      onFinish()
    } catch (error) {
      console.error('Error al generar todos los recibos:', error)
      toast.error('Error al generar los recibos')
    }
  }

  return (
    <Button onClick={handleGenerateAllReceipts} disabled={!selectedDate}>
      Confirmar e Imprimir
    </Button>
  )
}
