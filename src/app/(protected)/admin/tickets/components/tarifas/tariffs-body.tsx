'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getTariffPlanAction, saveTariffPlanAction } from '@/actions/tickets/tariff-plan.action';
import { TARIFF_VEHICLES, type TariffDraft, type TariffPlan } from '@/types/tariff-plan.type';
import { changeMethod, tariffMethod, validateTariffDraft } from '@/utils/tariff-plan.utils';
import { TariffEditor } from './tariff-editor';
import { TariffConfirmDialog } from './tariff-confirm-dialog';
import { TariffSummary } from './tariff-summary';
import { TariffSimulator } from './tariff-simulator';

const vehicles = TARIFF_VEHICLES;
const copyDraft = (plan: TariffPlan): TariffDraft => structuredClone({ schedule: plan.schedule, brackets: plan.brackets });

// Tarifas de los tickets por tiempo: lo vigente, un borrador que se aplica entero y un simulador
// que compara ambos. Se monta siempre (aunque su pestaña esté oculta) para no perder el borrador.
export function TariffsBody({ initialPlan, loadError, onDraftChange }: { initialPlan: TariffPlan | null; loadError?: string; onDraftChange?: (editing: boolean) => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState(initialPlan);
  const [draft, setDraft] = useState<TariffDraft | null>(null);
  const [baseRevision, setBaseRevision] = useState(initialPlan?.revision ?? '');
  const [baseDraft, setBaseDraft] = useState('');
  const [error, setError] = useState(loadError ?? '');
  const [conflict, setConflict] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pending, startTransition] = useTransition();
  const previousInitial = useRef(initialPlan?.revision);
  const dirty = draft !== null && JSON.stringify(draft) !== baseDraft;
  const retiredMethod = draft !== null && !['CUSTOM', 'STARTED'].includes(tariffMethod(draft));
  const errors = draft ? [...(retiredMethod ? ['Elegí Por hora o fracción o Lista de precios para continuar.'] : []), ...validateTariffDraft(draft, vehicles)] : [];
  const hasPrices = current && (current.schedule.pricingOptions.charging.enabled ? current.schedule.pricingOptions.charging.rates.length : current.brackets.length) > 0;

  useEffect(() => { onDraftChange?.(draft !== null); }, [draft, onDraftChange]);
  useEffect(() => {
    if (initialPlan && previousInitial.current !== initialPlan.revision) {
      previousInitial.current = initialPlan.revision;
      setCurrent(initialPlan);
      if (draft && initialPlan.revision !== baseRevision) setConflict(true);
      else if (!draft) setBaseRevision(initialPlan.revision);
    }
  }, [initialPlan, draft, baseRevision]);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.pathname === window.location.pathname && target.search === window.location.search) return;
      if (!window.confirm('Tenés cambios de tarifas sin aplicar. Si salís, se perderá este borrador. ¿Salir de todos modos?')) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); };
  }, [dirty]);
  const edit = () => {
    if (!current) return;
    const saved = copyDraft(current);
    // Sin precios cargados se arranca por hora o fracción, la forma de cobro predeterminada.
    const next = !saved.brackets.length && !saved.schedule.pricingOptions.charging.rates.length ? changeMethod(saved, 'STARTED') : saved;
    setDraft(next); setBaseDraft(JSON.stringify(next)); setBaseRevision(current.revision); setConflict(false); setError('');
  };
  const discard = () => {
    if (dirty) { setConfirmDiscard(true); return; }
    setDraft(null); setError(''); setConflict(false);
  };
  const reload = () => startTransition(async () => {
    const result = await getTariffPlanAction();
    if (result.error) setError(result.error);
    else if (result.plan) {
      setCurrent(result.plan); setError('');
      if (draft && result.plan.revision !== baseRevision) setConflict(true);
      else if (!draft) setBaseRevision(result.plan.revision);
    }
  });
  const save = () => {
    if (!draft || errors.length || conflict) return;
    startTransition(async () => {
      setError('');
      const result = await saveTariffPlanAction(baseRevision, draft);
      if (result.error) {
        setError(result.error);
        if (result.conflict) {
          setConflict(true);
          const latest = await getTariffPlanAction();
          if (latest.plan) setCurrent(latest.plan);
        }
        return;
      }
      if (result.plan) {
        setCurrent(result.plan); setBaseRevision(result.plan.revision); setDraft(null); setConflict(false);
        toast.success('Tarifas aplicadas. Se usan desde la próxima salida.'); router.refresh();
      }
    });
  };
  if (!current) return <section className="space-y-3 rounded-xl border p-5"><h2 className="font-semibold">No se pudieron cargar las tarifas</h2><p className="text-sm text-destructive" role="alert">{error || 'Intentá nuevamente.'}</p><Button variant="outline" disabled={pending} onClick={reload}>Volver a intentar</Button></section>;
  return <div className="space-y-6">
    <TariffSummary plan={current} vehicles={vehicles} />
    {!draft && <div className="flex flex-wrap items-center gap-3"><Button onClick={edit} disabled={pending}><Pencil className="mr-2 size-4" aria-hidden="true" />{hasPrices ? 'Editar tarifas' : 'Configurar mis tarifas'}</Button><p className="text-sm text-muted-foreground">Podés probar los cambios antes de aplicarlos.</p></div>}
    {draft && <section aria-labelledby="tariff-draft-heading" className="space-y-5 rounded-2xl border border-amber-500/40 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase tracking-wide text-amber-500">Borrador · todavía no se cobra</span><h2 id="tariff-draft-heading" className="mt-1 text-xl font-semibold">Editar tarifas</h2><p className="mt-1 text-sm text-muted-foreground">Todos los cambios se aplican juntos al finalizar.</p></div><Button type="button" variant="ghost" disabled={pending} onClick={discard}><X className="mr-1 size-4" aria-hidden="true" />{dirty ? 'Descartar cambios' : 'Cancelar'}</Button></div>
      <fieldset disabled={pending} className="min-w-0"><TariffEditor draft={draft} onChange={next => { setDraft(next); setError(''); }} vehicles={vehicles} /></fieldset>
      {errors.length > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm" role="status"><p className="font-medium">Para poder aplicar el borrador:</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map(message => <li key={message}>{message}</li>)}</ul></div>}
    </section>}
    <TariffSimulator draft={draft} revision={current.revision} invalid={retiredMethod} vehicles={vehicles} />
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
    {conflict && draft && <div role="alert" className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"><p className="font-semibold">Las tarifas cambiaron mientras editabas.</p><p>Tu borrador se conserva. Revisá la configuración vigente de arriba y comparala con tu borrador antes de continuar.</p>
      {current.revision !== baseRevision ? <Button type="button" variant="outline" disabled={pending} onClick={() => { setBaseRevision(current.revision); setDraft(previous => previous ? { ...previous, brackets: previous.brackets.map(row => { if (!row.id || current.brackets.some(saved => saved.id === row.id)) return row; const { id: _obsoleteId, ...fields } = row; return fields; }) } : previous); setBaseDraft(JSON.stringify(copyDraft(current))); setConflict(false); setError(''); }}>Revisé la versión vigente: conservar mi borrador</Button> : <Button variant="outline" disabled={pending} onClick={reload}>Cargar la versión vigente</Button>}
      <p className="text-xs text-muted-foreground">Luego podrás aplicar tu borrador completo. Si otra persona vuelve a modificar las tarifas, te avisaremos nuevamente.</p></div>}
    {draft && <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div><p className="text-sm font-medium">{dirty ? 'Tenés cambios sin aplicar' : 'Todavía no hay cambios'}</p><p className="mt-1 text-xs text-muted-foreground">Se usan en las salidas que se registren desde que las apliques, también para los tickets que ya están adentro.</p></div>
      <Button type="button" onClick={save} disabled={pending || !dirty || errors.length > 0 || conflict}><Save className="mr-2 size-4" aria-hidden="true" />{pending ? 'Aplicando…' : 'Aplicar tarifas'}</Button>
    </div>}
    <TariffConfirmDialog open={confirmDiscard} onOpenChange={setConfirmDiscard} title="¿Descartar los cambios?" description="Se perderán los cambios de este borrador. Tus tarifas vigentes se conservan." confirmLabel="Descartar borrador" onConfirm={() => { setDraft(null); setError(''); setConflict(false); }} />
  </div>;
}
