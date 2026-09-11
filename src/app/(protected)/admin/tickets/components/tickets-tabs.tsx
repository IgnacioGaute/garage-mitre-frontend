'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TicketsTabsProps {
  /** Barcode catalog table. */
  catalog: React.ReactNode;
  /** Day/night schedule + price-bracket ladder panel — omitted for non-admin users. */
  tarifas?: React.ReactNode;
  /** Visual cascade map of the price-bracket ladder — omitted for non-admin users. */
  mapaTarifas?: React.ReactNode;
  /** Day/week/month subscription rates — omitted for non-admin users. */
  tarifasDiaSemanaMes?: React.ReactNode;
}

const triggerClass =
  'gm-display rounded-[7px] px-4 py-2 text-[12.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-gm-yellow data-[state=active]:text-gm-ink data-[state=active]:shadow-none';

export function TicketsTabs({ catalog, tarifas, mapaTarifas, tarifasDiaSemanaMes }: TicketsTabsProps) {
  const showTarifas = Boolean(tarifas);
  const showMapaTarifas = Boolean(mapaTarifas);
  const showTarifasDiaSemanaMes = Boolean(tarifasDiaSemanaMes);

  return (
    <Tabs defaultValue="catalog" className="w-full">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-[10px] border border-border bg-gm-surface-2 p-1">
        <TabsTrigger value="catalog" className={triggerClass}>
          Códigos de barra
        </TabsTrigger>
        {showTarifas && (
          <TabsTrigger value="tarifas" className={triggerClass}>
            Tarifas
          </TabsTrigger>
        )}
        {showMapaTarifas && (
          <TabsTrigger value="mapaTarifas" className={triggerClass}>
            Mapa de tarifas
          </TabsTrigger>
        )}
        {showTarifasDiaSemanaMes && (
          <TabsTrigger value="tarifasDiaSemanaMes" className={triggerClass}>
            Día / semana / mes
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="catalog" className="mt-5 short:mt-4">
        {catalog}
      </TabsContent>
      {showTarifas && (
        <TabsContent value="tarifas" className="mt-5 short:mt-4">
          {tarifas}
        </TabsContent>
      )}
      {showMapaTarifas && (
        <TabsContent value="mapaTarifas" className="mt-5 short:mt-4">
          {mapaTarifas}
        </TabsContent>
      )}
      {showTarifasDiaSemanaMes && (
        <TabsContent value="tarifasDiaSemanaMes" className="mt-5 short:mt-4">
          {tarifasDiaSemanaMes}
        </TabsContent>
      )}
    </Tabs>
  );
}
