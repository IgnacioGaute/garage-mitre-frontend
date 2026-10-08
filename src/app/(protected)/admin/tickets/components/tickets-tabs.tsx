'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TARIFF_VEHICLES, type TariffPlan } from '@/types/tariff-plan.type';
import type { ticketPrice } from '@/types/ticket-price';
import { TariffsBody } from './tarifas/tariffs-body';
import { TariffPasses } from './tarifas/tariff-passes';

interface TicketsTabsProps {
  /** Barcode catalog table. */
  catalog: React.ReactNode;
  /** Tarifas por tiempo y de día/semana/mes — se omiten para usuarios que no son admin. */
  tariffs?: { plan: TariffPlan | null; loadError?: string; passPrices: ticketPrice[] };
}

const triggerClass =
  'gm-display rounded-[7px] px-4 py-2 text-[12.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-gm-yellow data-[state=active]:text-gm-ink data-[state=active]:shadow-none';

export function TicketsTabs({ catalog, tariffs }: TicketsTabsProps) {
  const [tab, setTab] = useState('catalog');
  const [editing, setEditing] = useState(false);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-[10px] border border-border bg-gm-surface-2 p-1">
        <TabsTrigger value="catalog" className={triggerClass}>
          Tickets
        </TabsTrigger>
        {tariffs && (
          <TabsTrigger value="porTiempo" className={triggerClass}>
            Por tiempo
            {editing && <span className="ml-2 normal-case tracking-normal text-amber-600 dark:text-amber-400">· Borrador</span>}
          </TabsTrigger>
        )}
        {tariffs && (
          <TabsTrigger value="diaSemanaMes" className={triggerClass}>
            Día / semana / mes
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="catalog" className="mt-5 short:mt-4">
        {catalog}
      </TabsContent>
      {tariffs && (
        // Montado siempre: cambiar de pestaña no puede descartar un borrador sin aplicar.
        <TabsContent value="porTiempo" forceMount className="mt-5 short:mt-4 data-[state=inactive]:hidden">
          <TariffsBody initialPlan={tariffs.plan} loadError={tariffs.loadError} onDraftChange={setEditing} />
        </TabsContent>
      )}
      {tariffs && (
        <TabsContent value="diaSemanaMes" className="mt-5 short:mt-4">
          <TariffPasses prices={tariffs.passPrices} vehicles={TARIFF_VEHICLES} />
        </TabsContent>
      )}
    </Tabs>
  );
}
