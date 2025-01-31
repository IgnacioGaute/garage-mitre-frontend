'use server';

import { scannerSchema, ScannerSchemaType } from '@/schemas/ticket-registration.schema';
import { startScanner as startScannerAPI } from '@/services/scanner.service'

export async function scannerAction(values: ScannerSchemaType) {
  const validatedFields = scannerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const renter = await startScannerAPI(validatedFields.data);

    if (!renter) {
      return { error: 'Error al scannear' };
    }
    return { success: 'Escaneo exitoso' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al scannear' };
  }
}
