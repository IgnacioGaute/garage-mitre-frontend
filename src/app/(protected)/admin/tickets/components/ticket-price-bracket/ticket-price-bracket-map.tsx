'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Car, ChevronRight, Clock, Infinity as InfinityIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketPriceBracket } from '@/types/ticket-price-bracket.type';
import { TicketDayType, VehicleType } from '@/types/ticket-price';
import { TicketSchedule } from '@/services/tickets.service';
import {
  DurationUnit,
  formatMinutesLabel,
  formatRecurringUnitLabel,
  minutesToAmountUnit,
  resolveRecurringUnitPrice,
} from '@/utils/ticket-price-bracket.utils';

const TIER_RANK: Record<DurationUnit, number> = { MIN: 0, HOUR: 1, DAY: 2 };

const ars = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const pad = (h: number) => `${h.toString().padStart(2, '0')}:00`;

// Mismos colores que la columna "Horario" de la tabla de tarifas (Badge variant "yellow"/"blue"):
// nada de neón — solo texto/borde en el tono, con un fondo apenas teñido, igual que un badge.
const PERIOD_ACCENT: Record<TicketDayType, { solid: string; text: string; border: string; tint: string }> = {
  DAY: { solid: 'hsl(46 92% 53%)', text: 'hsl(46 92% 53%)', border: 'hsl(46 92% 53% / 0.4)', tint: 'hsl(46 92% 53% / 0.12)' },
  NIGHT: { solid: 'hsl(200 60% 60%)', text: '#8FCDF0', border: 'hsl(200 60% 60% / 0.4)', tint: 'hsl(200 60% 60% / 0.12)' },
};
const ORANGE = { text: '#FF8458', border: 'hsl(14 80% 51% / 0.4)', tint: 'hsl(14 80% 51% / 0.12)' };
const DANGER = { text: '#F08775', border: 'hsl(10 78% 56% / 0.5)', tint: 'hsl(10 78% 56% / 0.14)' };

type LoopInfo = {
  indices: number[];
  /** true si el reinicio puede terminar cobrando más que la franja de hora a la que se llega —
   * un vehículo que se queda MENOS tiempo pagaría MÁS que uno que llega a la hora completa. */
  warning: boolean;
  cascadeMax: number;
  coveringPrice: number;
};

type NodeData = {
  id: string;
  index: number;
  duration: string;
  price: number;
  isOpen: boolean;
  unitLabel?: string;
  sourceLabel?: string;
};

export function TicketPriceBracketMap({
  brackets,
  schedule,
  embedded = false,
}: {
  brackets: TicketPriceBracket[];
  schedule: TicketSchedule;
  /** true cuando se muestra dentro de otro contenedor (ej. un dialog) — omite su propia tarjeta. */
  embedded?: boolean;
}) {
  const vehicleTypes = useMemo(
    () => Array.from(new Set(brackets.map((b) => b.vehicleType))) as VehicleType[],
    [brackets],
  );
  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicleTypes[0] ?? 'AUTO');
  const [period, setPeriod] = useState<TicketDayType>('DAY');

  const effectiveVehicleType = vehicleTypes.includes(vehicleType) ? vehicleType : vehicleTypes[0] ?? 'AUTO';

  const pool = brackets.filter(
    (b) => b.vehicleType === effectiveVehicleType && (b.ticketDayType === null || b.ticketDayType === period),
  );
  const finite = [...pool].filter((b) => b.uptoMinutes !== null).sort((a, b) => a.uptoMinutes! - b.uptoMinutes!);
  const openEnded = pool.find((b) => b.uptoMinutes === null) ?? null;

  const nodes: NodeData[] = finite.map((b, i) => ({
    id: b.id,
    index: i + 1,
    duration: formatMinutesLabel(b.uptoMinutes),
    price: b.price,
    isOpen: false,
  }));

  // Misma regla que usa el backend para la cascada (resolveBracketOrCascade): al pasar una
  // franja de horas/días (+ tolerancia) sin llegar todavía a la siguiente, no salta directo —
  // vuelve a cobrar la escalera de franjas más chicas (minutos) sobre lo que sobra. Acá marcamos
  // en qué transición pasa eso, a qué franjas anteriores "vuelve", y si el peor caso del reinicio
  // (la franja anterior + la más cara de las que reinicia) puede superar el precio de esta franja
  // de hora — si pasa, alguien que se queda MENOS tiempo pagaría MÁS que la hora completa.
  const loopBackByIndex: (LoopInfo | null)[] = finite.map((b, i) => {
    if (i === 0) return null;
    const prevTier = minutesToAmountUnit(finite[i - 1].uptoMinutes!).unit;
    if (prevTier === 'MIN') return null;
    const prevRank = TIER_RANK[prevTier];
    const smaller = finite
      .map((sb, idx) => ({ tier: minutesToAmountUnit(sb.uptoMinutes!).unit, idx, price: sb.price }))
      .filter(({ tier }) => TIER_RANK[tier] < prevRank);
    if (smaller.length === 0) return null;
    const cascadeMax = finite[i - 1].price + Math.max(...smaller.map((s) => s.price));
    return {
      indices: smaller.map((s) => s.idx + 1),
      warning: cascadeMax > b.price,
      cascadeMax,
      coveringPrice: b.price,
    };
  });

  if (openEnded) {
    let price = openEnded.price;
    let unitLabel: string | undefined;
    let sourceLabel: string | undefined;
    if (openEnded.recurringUnitMinutes) {
      const resolved = resolveRecurringUnitPrice(openEnded.recurringUnitMinutes, finite, openEnded.id);
      if (resolved) {
        price = resolved.price;
        sourceLabel = resolved.sourceLabel;
      }
      unitLabel = formatRecurringUnitLabel(openEnded.recurringUnitMinutes);
    }
    nodes.push({
      id: openEnded.id,
      index: finite.length + 1,
      duration: 'Sin límite',
      price,
      isOpen: true,
      unitLabel,
      sourceLabel,
    });
  }

  const accent = PERIOD_ACCENT[period];

  return (
    <div className={embedded ? '' : 'rounded-2xl border border-border bg-gm-surface-2 p-6 sm:p-8'}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="gm-display text-[22px] font-bold text-foreground">Mapa de tarifas</h3>
          <p className="mt-1 max-w-[520px] text-[13.5px] text-muted-foreground">
            En qué orden se van aplicando las franjas, la tolerancia entre saltos, y cómo cambia
            entre día y noche.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {vehicleTypes.length > 1 ? (
            <Select value={effectiveVehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
              <SelectTrigger className="h-10 w-[150px] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((vt) => (
                  <SelectItem key={vt} value={vt}>
                    {vt === 'AUTO' ? 'Auto' : 'Camioneta'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-gm-surface-3 px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              <Car className="size-4" />
              {effectiveVehicleType === 'AUTO' ? 'Auto' : 'Camioneta'}
            </span>
          )}
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-gm-surface-3 p-1">
            <button
              type="button"
              onClick={() => setPeriod('DAY')}
              className={cn(
                'rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.03em] transition-colors',
                period === 'DAY' ? 'bg-gm-yellow text-gm-ink' : 'text-muted-foreground',
              )}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setPeriod('NIGHT')}
              className={cn(
                'rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.03em] transition-colors',
                period !== 'NIGHT' && 'text-muted-foreground',
              )}
              style={period === 'NIGHT' ? { backgroundColor: PERIOD_ACCENT.NIGHT.solid, color: 'hsl(30 78% 7%)' } : undefined}
            >
              Noche
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 rounded-xl border border-border bg-gm-surface-3/60 px-5 py-3.5 text-[13.5px]">
        <span className="flex items-center gap-2" style={{ color: PERIOD_ACCENT.DAY.text }}>
          <Clock className="size-4" />
          Día <strong className="gm-mono text-foreground">{pad(schedule.dayStartHour)} – {pad(schedule.dayEndHour)}</strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-2" style={{ color: PERIOD_ACCENT.NIGHT.text }}>
          <Clock className="size-4" />
          Noche <strong className="gm-mono text-foreground">{pad(schedule.dayEndHour)} – {pad(schedule.dayStartHour)}</strong>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-2" style={{ color: ORANGE.text }}>
          <Clock className="size-4" />
          Tolerancia global <strong className="gm-mono text-foreground">{schedule.graceMinutes} min</strong>
        </span>
      </div>

      {nodes.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-border bg-gm-surface-3/40 p-10 text-center text-[13.5px] text-muted-foreground">
          No hay tarifas cargadas para {effectiveVehicleType === 'AUTO' ? 'Auto' : 'Camioneta'} en
          horario {period === 'DAY' ? 'Día' : 'Noche'}.
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-center gap-y-8">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex items-start">
                <div className="relative flex w-[132px] shrink-0 flex-col items-center text-center sm:w-[150px]">
                  <span className="absolute -top-2 left-1.5 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-gm-surface-3 font-mono text-[10.5px] font-bold text-muted-foreground">
                    {node.index}
                  </span>
                  <div
                    className="mb-3.5 flex size-12 items-center justify-center rounded-full sm:size-14"
                    style={{
                      border: `1.5px ${node.isOpen ? 'dashed' : 'solid'} ${node.isOpen ? ORANGE.border : accent.border}`,
                      background: node.isOpen ? ORANGE.tint : accent.tint,
                      color: node.isOpen ? ORANGE.text : accent.text,
                    }}
                  >
                    {node.isOpen ? <InfinityIcon className="size-5 sm:size-6" /> : <Clock className="size-5 sm:size-6" />}
                  </div>
                  <div className="w-full rounded-[16px] border border-border bg-gm-surface-2 px-2.5 py-3.5">
                    <div className="text-[11.5px] font-semibold uppercase tracking-[0.03em] text-muted-foreground">
                      {node.duration}
                    </div>
                    <div
                      className="gm-mono mt-1.5 text-[19px] font-bold leading-tight tabular-nums sm:text-[21px]"
                      style={{ color: node.isOpen ? ORANGE.text : accent.text }}
                    >
                      {ars(node.price)}
                      {node.unitLabel && (
                        <span className="ml-1 text-[11.5px] font-normal normal-case text-muted-foreground">
                          {node.unitLabel}
                        </span>
                      )}
                    </div>
                    {node.isOpen && node.sourceLabel && (
                      <div className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
                        según &quot;{node.sourceLabel}&quot;
                      </div>
                    )}
                  </div>
                </div>
                {i < nodes.length - 1 && (
                  loopBackByIndex[i + 1] ? (
                    <div className="flex w-[136px] shrink-0 flex-col items-center gap-1.5 pt-7 text-center sm:pt-9">
                      <span
                        className="gm-mono whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: ORANGE.border, background: ORANGE.tint, color: ORANGE.text }}
                      >
                        +{schedule.graceMinutes} min
                      </span>
                      <div className="flex items-center gap-1 text-[9.5px] font-semibold" style={{ color: ORANGE.text }}>
                        <RotateCcw className="size-3" />
                        reinicia
                      </div>
                      <div className="flex items-center gap-[3px]">
                        {loopBackByIndex[i + 1]!.indices.map((idx, k) => (
                          <div key={idx} className="flex items-center gap-[3px]">
                            <span
                              className="gm-mono flex size-[17px] items-center justify-center rounded-full border text-[9px] font-bold"
                              style={{ borderColor: ORANGE.border, background: ORANGE.tint, color: ORANGE.text }}
                            >
                              {idx}
                            </span>
                            {k < loopBackByIndex[i + 1]!.indices.length - 1 && (
                              <ChevronRight className="size-2.5 opacity-60" style={{ color: ORANGE.text }} />
                            )}
                          </div>
                        ))}
                      </div>
                      <span
                        className="gm-mono whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: ORANGE.border, background: ORANGE.tint, color: ORANGE.text }}
                      >
                        +{schedule.graceMinutes} min
                      </span>
                      {loopBackByIndex[i + 1]!.warning && (
                        <div
                          className="flex flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5"
                          style={{ borderColor: DANGER.border, background: DANGER.tint }}
                        >
                          <div className="flex items-center gap-1 text-[9px] font-bold" style={{ color: DANGER.text }}>
                            <AlertTriangle className="size-3" />
                            ojo
                          </div>
                          <div className="gm-mono text-[9px] leading-tight" style={{ color: DANGER.text }}>
                            {ars(loopBackByIndex[i + 1]!.cascadeMax)} &gt; {ars(loopBackByIndex[i + 1]!.coveringPrice)}
                          </div>
                          <div className="text-[8.5px] leading-tight" style={{ color: DANGER.text }}>
                            puede cobrar más que {nodes[i + 1].duration.toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex w-[42px] shrink-0 flex-col items-center pt-7 sm:w-[52px] sm:pt-9">
                      <div className="relative h-[1.5px] w-full opacity-70">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `repeating-linear-gradient(90deg, ${ORANGE.text} 0 6px, transparent 6px 11px)`,
                          }}
                        />
                        <ChevronRight
                          className="absolute -right-0.5 -top-[6px] size-3.5"
                          style={{ color: ORANGE.text }}
                        />
                      </div>
                      <span
                        className="gm-mono mt-2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: ORANGE.border, background: ORANGE.tint, color: ORANGE.text }}
                      >
                        +{schedule.graceMinutes} min
                      </span>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
          {openEnded?.recurringUnitMinutes && (
            <p className="mt-3 text-center text-[12.5px] italic text-muted-foreground">
              y sigue sumando {formatRecurringUnitLabel(openEnded.recurringUnitMinutes)}…
            </p>
          )}
        </div>
      )}

      <p className="mx-auto mt-7 max-w-[820px] text-center text-[13.5px] leading-relaxed text-muted-foreground">
        Se lee de izquierda a derecha: cada franja cobra según el tiempo transcurrido hasta su
        &quot;hasta&quot;. Pasarse por menos de la tolerancia todavía <b className="text-foreground">no</b>{' '}
        hace saltar a la franja siguiente. Donde dice <span className="inline-flex items-center gap-1 align-middle" style={{ color: ORANGE.text }}><RotateCcw className="size-3" />reinicia</span>,
        si al pasar una franja de horas todavía no se llegó a la siguiente, <b className="text-foreground">no se cobra directo esa franja</b>:
        se vuelve a cobrar como al principio, franja por franja, sobre el tiempo que sobra. Al
        agotar la última franja con techo, se pasa a <b className="text-foreground">Sin límite</b>.
      </p>
    </div>
  );
}
