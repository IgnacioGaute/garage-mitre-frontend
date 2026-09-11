'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Plus, Timer } from 'lucide-react';
import { ticketPriceBracketSchema, TicketPriceBracketSchemaType } from '@/schemas/ticket-price-bracket.schema';
import { createTicketPriceBracketAction } from '@/actions/tickets/create-ticket-price-bracket.action';
import {
  amountUnitToMinutes,
  DurationUnit,
  findOpenEndedConflict,
  formatMinutesLabel,
  formatRecurringUnitLabel,
  resolveRecurringUnitPrice,
  scopeBracketsFor,
} from '@/utils/ticket-price-bracket.utils';
import { TicketPriceBracket } from '@/types/ticket-price-bracket.type';

export function CreateTicketPriceBracketDialog({
  brackets = [],
}: {
  /** Franjas ya cargadas — se usan para no duplicar la franja sin límite. */
  brackets?: TicketPriceBracket[];
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [noLimit, setNoLimit] = useState(false);
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<DurationUnit>('MIN');
  const [recurring, setRecurring] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState<number>(1);
  const [recurringUnit, setRecurringUnit] = useState<DurationUnit>('DAY');

  const form = useForm<TicketPriceBracketSchemaType>({
    resolver: zodResolver(ticketPriceBracketSchema),
    defaultValues: {
      label: '',
      vehicleType: 'AUTO',
      ticketDayType: 'DAY',
      uptoMinutes: undefined,
      price: undefined,
    },
  });

  // Solo puede existir una franja sin límite por combinación de vehículo + horario; si no, el
  // sistema no sabría cuál usar al cobrar (siempre usa la primera que encuentra).
  const watchedVehicleType = form.watch('vehicleType');
  const watchedDayType = form.watch('ticketDayType');
  const openEndedConflict = noLimit
    ? findOpenEndedConflict(brackets, watchedVehicleType, watchedDayType)
    : null;

  // Sugiere el precio por bloque solo (misma cuenta que usa el backend al cobrar): coincidencia
  // exacta con otra franja, o derivado proporcional de una escala más grande (ej. "cada 1
  // minuto" toma "hasta 1 hora" ÷ 60). Se puede seguir editando a mano después.
  const scopedBrackets = scopeBracketsFor(brackets, watchedVehicleType, watchedDayType);
  const suggestedRecurringPrice =
    noLimit && recurring
      ? resolveRecurringUnitPrice(amountUnitToMinutes(recurringAmount, recurringUnit), scopedBrackets)
      : null;

  useEffect(() => {
    if (suggestedRecurringPrice) {
      form.setValue('price', suggestedRecurringPrice.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedRecurringPrice?.price]);

  const resetLocalState = () => {
    form.reset();
    setNoLimit(false);
    setAmount(1);
    setUnit('MIN');
    setRecurring(false);
    setRecurringAmount(1);
    setRecurringUnit('DAY');
  };

  const onSubmit = (values: TicketPriceBracketSchemaType) => {
    if (openEndedConflict) {
      toast.error(`Ya existe una franja sin límite para esa combinación: "${openEndedConflict.label}".`);
      return;
    }
    startTransition(async () => {
      const data = await createTicketPriceBracketAction({
        ...values,
        uptoMinutes: noLimit ? undefined : amountUnitToMinutes(amount, unit),
        recurringUnitMinutes: noLimit && recurring ? amountUnitToMinutes(recurringAmount, recurringUnit) : undefined,
      });
      if (!data || data.error) {
        const errorMessage = typeof data?.error === 'string' ? data.error : data?.error?.message;
        toast.error(errorMessage ?? 'Error desconocido');
      } else {
        toast.success('Franja de precio creada exitosamente');
        resetLocalState();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 rounded-md text-[12px] font-semibold" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" />
          Nueva franja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-gm-yellow/40 bg-gm-yellow/15 text-gm-yellow">
              <Timer className="size-4" />
            </span>
            <div>
              <DialogTitle>Nueva franja de precio</DialogTitle>
              <DialogDescription className="mt-0.5">
                Armá un escalón de la tarifa según cuánto tiempo estuvo el vehículo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la franja</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder='Ej: "Hasta 1 hora", "3 días"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vehículo</FormLabel>
                  <FormControl>
                    <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTO">Auto</SelectItem>
                        <SelectItem value="CAMIONETA">Camioneta</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketDayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario</FormLabel>
                  <FormControl>
                    <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Día</SelectItem>
                        <SelectItem value="NIGHT">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Última franja (sin límite de tiempo)</FormLabel>
                <Switch checked={noLimit} onCheckedChange={setNoLimit} disabled={isPending} />
              </div>
            </FormItem>

            {!noLimit && (
              <div className="flex gap-2">
                <FormItem className="flex-1">
                  <FormLabel>Hasta</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isPending}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="w-32">
                  <FormLabel>Unidad</FormLabel>
                  <FormControl>
                    <Select disabled={isPending} value={unit} onValueChange={(v) => setUnit(v as DurationUnit)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIN">Minutos</SelectItem>
                        <SelectItem value="HOUR">Horas</SelectItem>
                        <SelectItem value="DAY">Días</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              </div>
            )}

            {!noLimit && (
              <p className="-mt-2 text-[12px] text-gm-yellow">
                Esta franja queda configurada como: <strong>{formatMinutesLabel(amountUnitToMinutes(amount, unit))}</strong> — revisá que coincida con el nombre de arriba.
              </p>
            )}

            {noLimit && (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Tarifa recurrente (en vez de un monto fijo único)</FormLabel>
                  <Switch checked={recurring} onCheckedChange={setRecurring} disabled={isPending} />
                </div>
                <p className="text-[12px] text-muted-foreground">
                  {recurring
                    ? 'El precio se va a cobrar repetidas veces según cuánto dure la estadía (ej. "$1500 por cada día").'
                    : 'Sin esto, "sin límite" cobra un monto fijo una sola vez, sin importar cuánto más se quede — no suele tener sentido si no sabés cuánto va a durar la estadía.'}
                </p>
              </FormItem>
            )}

            {noLimit && recurring && (
              <div className="flex gap-2">
                <FormItem className="flex-1">
                  <FormLabel>Cada</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isPending}
                      value={recurringAmount}
                      onChange={(e) => setRecurringAmount(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="w-32">
                  <FormLabel>Unidad</FormLabel>
                  <FormControl>
                    <Select disabled={isPending} value={recurringUnit} onValueChange={(v) => setRecurringUnit(v as DurationUnit)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIN">Minutos</SelectItem>
                        <SelectItem value="HOUR">Horas</SelectItem>
                        <SelectItem value="DAY">Días</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              </div>
            )}

            {noLimit && recurring && (
              <p className="-mt-2 text-[12px] text-gm-yellow">
                Se va a cobrar {formatRecurringUnitLabel(amountUnitToMinutes(recurringAmount, recurringUnit))} de estadía.
              </p>
            )}

            {openEndedConflict && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-[#F08775]">
                Ya hay una franja sin límite para{' '}
                {watchedVehicleType === 'CAMIONETA' ? 'camioneta' : 'auto'} en horario{' '}
                {watchedDayType === 'NIGHT' ? 'noche' : 'día'}:{' '}
                <strong>{openEndedConflict.label}</strong>. Solo puede haber una — editá esa
                franja en vez de crear otra.
              </p>
            )}

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{noLimit && recurring ? 'Precio por cada bloque' : 'Precio'}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isPending}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  {suggestedRecurringPrice && (
                    <p className="text-[11px] text-muted-foreground">
                      Sugerido automáticamente según &quot;{suggestedRecurringPrice.sourceLabel}&quot; — podés cambiarlo.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={isPending || Boolean(openEndedConflict)}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Crear franja de precio
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
