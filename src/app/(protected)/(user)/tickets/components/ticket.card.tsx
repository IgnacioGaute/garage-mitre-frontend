"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TicketRegistration } from "@/types/ticket-registration.type";
import { Ticket } from "@/types/ticket.type";
import { TicketRegistrationForDay } from "@/types/ticket-registration-for-day.type";
import { CreateTicketRegistrationDialog } from "../tickets-days-or-weeks/create-ticket-registration-for-day-dialog";
import { ActiveTicketDialog } from "./active-ticket-dialog";
import { ActiveDayTicketDialog } from "./active-day-ticket-dialog";
import { PaymentMethodDialog } from "./payment-method-dialog";
import { PriceBracketMapDialog } from "./price-bracket-map-dialog";
import { setPaymentMethodAction } from "@/actions/tickets/set-payment-method.action";
import { retireOverdueRegistrationsAction } from "@/actions/tickets/retire-overdue-registrations.action";
import { TicketPriceBracket } from "@/types/ticket-price-bracket.type";
import { TicketSchedule } from "@/services/tickets.service";
import ScannerButton from "../../components/scanner-button";
import { useTour, tourHighlight, tourTransition } from "./ticket-tour";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Trash2 } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = "America/Argentina/Buenos_Aires";

const TOUR_STEPS = [
  {
    key: "scanner",
    title: "Escáner de código de barras",
    desc: "El sistema escucha el lector de código de barras en todo momento: pasá el ticket y registra automáticamente la entrada o salida del vehículo.",
  },
  {
    key: "manual",
    title: "Ingreso manual de código",
    desc: "Si el código de barras no escanea, tocá acá para escribirlo a mano y confirmarlo.",
  },
  {
    key: "ticket",
    title: "Último registro",
    desc: "Acá ves el detalle del último ticket procesado: código de barras, horario de entrada y salida, y el precio calculado según tipo de vehículo.",
  },
  {
    key: "occupancy",
    title: "Vehículos en el playón",
    desc: "Todos los tickets del catálogo. Los casilleros en amarillo siguen activos (fueron escaneados y no registraron salida, el vehículo sigue en el playón); los grises están inactivos o libres.",
  },
  {
    key: "dayTicket",
    title: "Tickets por día o semana",
    desc: "Para tickets de día completo o semana entera, usá este botón para registrarlos manualmente sin necesidad de escanear el código.",
  },
];

// `ticket.ticketRegistration` on the catalog entity doesn't reliably reflect
// the most recent scan, so match against the live registrations list instead
// — day tickets link back via `registration.ticket`, hourly ones via the
// scanned barcode itself.
function latestRegistrationForTicket(t: Ticket, registrations: TicketRegistration[]) {
  const matches = registrations.filter(
    (r) => r.ticket?.id === t.id || r.codeBarTicket === t.codeBar
  );
  if (matches.length === 0) return null;
  return matches.reduce((latest, r) =>
    new Date(r.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? r : latest
  );
}

// A catalog ticket is active (still in the lot) until its latest registration
// has its departure scanned.
function isTicketActive(t: Ticket, registrations: TicketRegistration[]) {
  const latest = latestRegistrationForTicket(t, registrations);
  return !!latest && !latest.departureTime && !latest.departureDay;
}

// Fecha estimada de vencimiento: fecha de alta + la duración comprada. `null` si no hay fecha
// de alta (no debería pasar, pero evita reventar el cálculo).
function dayRegistrationDueDate(r: TicketRegistrationForDay): Date | null {
  if (!r.dateNow) return null;
  const dueDate = new Date(r.dateNow);
  if (r.ticketTimeType === 'MES' || r.ticketTimeType === 'MES_Y_DIA') {
    dueDate.setMonth(dueDate.getMonth() + (r.months ?? 0));
    if (r.ticketTimeType === 'MES_Y_DIA') {
      dueDate.setDate(dueDate.getDate() + (r.days ?? 0));
    }
  } else {
    const totalDays =
      r.ticketTimeType === 'SEMANA'
        ? (r.weeks ?? 0) * 7
        : r.ticketTimeType === 'SEMANA_Y_DIA'
          ? (r.weeks ?? 0) * 7 + (r.days ?? 0)
          : r.days ?? 0; // DIA
    dueDate.setDate(dueDate.getDate() + totalDays);
  }
  return dueDate;
}

// Un ticket por día/semana/mes sigue "en el playón" mientras no se haya registrado su salida —
// pasar la fecha comprada NO lo saca de esta lista ni cambia lo que se cobra (este flujo no
// tiene ninguna conexión con la escalera de tarifas por hora): solo queda marcado como vencido
// para que no se pierda de vista.
function isDayRegistrationActive(r: TicketRegistrationForDay) {
  return !r.retired;
}

function isDayRegistrationOverdue(r: TicketRegistrationForDay) {
  if (r.retired) return false;
  const dueDate = dayRegistrationDueDate(r);
  if (!dueDate) return false;
  return dueDate.getTime() < new Date().setHours(0, 0, 0, 0);
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold text-foreground gm-tnum">{value || "—"}</dd>
    </div>
  );
}

export default function CardTicket({
  initialRegistrations,
  ticketCatalog,
  priceBrackets,
  schedule,
  registrationsForDay,
  isAdmin = false,
}: {
  initialRegistrations: TicketRegistration[];
  ticketCatalog: Ticket[];
  priceBrackets: TicketPriceBracket[];
  schedule: TicketSchedule | null;
  registrationsForDay: TicketRegistrationForDay[];
  isAdmin?: boolean;
}) {
  const [registrations, setRegistrations] =
    useState<TicketRegistration[]>(initialRegistrations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [openDayRegistrationId, setOpenDayRegistrationId] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ id: string; price: number } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"hourly" | "daily">("hourly");
  const router = useRouter();
  const tour = useTour(TOUR_STEPS);

  const tourStyle = (key: string) =>
    tour.isActive(key) ? { ...tourTransition, ...tourHighlight } : tourTransition;

  // router.refresh() re-renders the server-fetched props in place — sync
  // them into state so the update actually shows up (state initializers only
  // run once on mount, they don't pick up later prop changes on their own).
  useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  const latestRegistration =
    registrations.length > 0
      ? [...registrations].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]
      : null;

  const formatDate = (date: string | Date) => {
    if (!date) return "—";
    if (typeof date === "string") {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Si el ticket todavía tiene vehículo asignado, el último registro es una entrada.
  const isEntry = !!latestRegistration?.ticket?.vehicleType;
  const todayStr = dayjs().tz(TZ).format("DD/MM/YYYY");
  const sortedCatalog = [...ticketCatalog].sort(
    (a, b) => parseInt(a.codeBar, 10) - parseInt(b.codeBar, 10)
  );
  const activeTickets = sortedCatalog.filter((t) => isTicketActive(t, registrations));
  const openTicket = openTicketId
    ? sortedCatalog.find((t) => t.id === openTicketId) ?? null
    : null;
  const openRegistration = openTicket
    ? latestRegistrationForTicket(openTicket, registrations)
    : null;

  const activeDayRegistrations = registrationsForDay.filter(isDayRegistrationActive);
  const overdueDayRegistrations = activeDayRegistrations.filter(isDayRegistrationOverdue);
  const openDayRegistration = openDayRegistrationId
    ? activeDayRegistrations.find((r) => r.id === openDayRegistrationId) ?? null
    : null;

  const tabClass = (tab: "hourly" | "daily") =>
    cn(
      "flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
      sidebarTab === tab
        ? "bg-card text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────── */}
      <div className="max-w-[1180px] mx-auto mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap border-b border-border pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Registro de estacionamiento
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Escaneá el código de barras del ticket para registrar la entrada o salida.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{todayStr}</span>
            {tour.node}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto flex gap-6 flex-wrap items-start">
        {/* ── Columna principal ────────────────────────────────── */}
        <div className="flex-1 min-w-0 sm:min-w-[320px] space-y-6">
          <ScannerButton
            isDialogOpen={isDialogOpen}
            onTicketRegistered={() => router.refresh()}
            onTicketExited={(registration) => setPendingPayment(registration)}
            scannerRef={(el) => tour.refFor("scanner")(el)}
            scannerStyle={tourStyle("scanner")}
            manualRef={(el) => tour.refFor("manual")(el)}
            manualStyle={tourStyle("manual")}
            extraActions={
              <div ref={(el) => tour.refFor("dayTicket")(el)} style={tourStyle("dayTicket")}>
                <CreateTicketRegistrationDialog setIsDialogOpen={setIsDialogOpen} />
              </div>
            }
          />

          {/* ── Último registro ── */}
          <div
            ref={(el) => tour.refFor("ticket")(el)}
            style={tourStyle("ticket")}
            className="rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Último registro</h2>
              {latestRegistration && (
                <Badge variant={isEntry ? "blue" : "green"} className="px-3 py-1 text-sm">
                  {isEntry ? "Entrada" : "Salida"}
                </Badge>
              )}
            </div>

            <div className="p-6">
              {!latestRegistration ? (
                <p className="py-8 text-center text-base text-muted-foreground">
                  No hay registros todavía. Escaneá un código de barras para comenzar.
                </p>
              ) : isEntry ? (
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Código" value={latestRegistration.ticket?.codeBar} />
                  <Field
                    label="Vehículo"
                    value={latestRegistration.ticket?.vehicleType === "AUTO" ? "Automóvil" : "Camioneta"}
                  />
                  <Field label="Día de entrada" value={formatDate(latestRegistration.entryDay)} />
                  <Field label="Horario de entrada" value={latestRegistration.entryTime} />
                  {latestRegistration.description && (
                    <div className="sm:col-span-2">
                      <Field label="Descripción" value={latestRegistration.description} />
                    </div>
                  )}
                </dl>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg bg-gm-surface-2 p-5 text-center">
                    <p className="text-sm text-muted-foreground">Total a cobrar</p>
                    <p className="mt-1 text-4xl font-bold text-foreground gm-tnum">
                      ${latestRegistration.price}
                    </p>
                  </div>
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Código" value={latestRegistration.codeBarTicket} />
                    <Field label="Día de salida" value={formatDate(latestRegistration.departureDay)} />
                    <Field label="Horario de entrada" value={latestRegistration.entryTime} />
                    <Field label="Horario de salida" value={latestRegistration.departureTime} />
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Lateral: vehículos en el playón ──────────────────── */}
        <div
          ref={(el) => tour.refFor("occupancy")(el)}
          style={tourStyle("occupancy")}
          className="w-full sm:w-[320px] shrink-0 rounded-xl border border-border bg-card p-5 sm:sticky sm:top-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">En el playón</h2>
            <PriceBracketMapDialog brackets={priceBrackets} schedule={schedule} />
          </div>

          <div className="mb-5 flex gap-1 rounded-xl bg-gm-surface-2 p-1">
            <button type="button" onClick={() => setSidebarTab("hourly")} className={tabClass("hourly")}>
              Por hora
              <span className="gm-tnum text-muted-foreground">({activeTickets.length})</span>
            </button>
            <button type="button" onClick={() => setSidebarTab("daily")} className={tabClass("daily")}>
              Día / Sem / Mes
              <span className="gm-tnum text-muted-foreground">({activeDayRegistrations.length})</span>
            </button>
          </div>

          {sidebarTab === "hourly" ? (
            <>
              {sortedCatalog.length > 0 ? (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {activeTickets.length} de {sortedCatalog.length} tickets ocupados
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {sortedCatalog.map((t) => {
                      const active = isTicketActive(t, registrations);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-disabled={!active}
                          tabIndex={active ? 0 : -1}
                          onClick={() => { if (active) setOpenTicketId(t.id); }}
                          title={
                            active
                              ? `Ticket ${t.codeBar} · activo — ver detalle`
                              : `Ticket ${t.codeBar} · libre`
                          }
                          className={cn(
                            "h-11 rounded-lg border text-sm font-semibold gm-tnum transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border-gm-yellow bg-gm-yellow text-gm-ink cursor-pointer hover:bg-[hsl(var(--gm-yellow-deep))]"
                              : "border-border bg-gm-surface-2 text-muted-foreground cursor-default",
                          )}
                        >
                          {t.codeBar}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-sm bg-gm-yellow" />
                      Ocupado · tocá para ver el detalle
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-sm border border-border bg-gm-surface-2" />
                      Libre
                    </div>
                  </div>
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No hay tickets registrados.
                </p>
              )}
            </>
          ) : activeDayRegistrations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {overdueDayRegistrations.length > 0 && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    {overdueDayRegistrations.length} vencido{overdueDayRegistrations.length === 1 ? "" : "s"}
                  </span>
                  <ConfirmActionDialog
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        Eliminar vencidos
                      </Button>
                    }
                    title="¿Eliminar los tickets vencidos?"
                    description={`Se van a sacar ${overdueDayRegistrations.length} ticket${overdueDayRegistrations.length === 1 ? "" : "s"} vencido${overdueDayRegistrations.length === 1 ? "" : "s"} de esta lista.`}
                    tone="warning"
                    actionLabel="Eliminar vencidos"
                    actionVariant="destructive"
                    onConfirm={async () => {
                      const result = await retireOverdueRegistrationsAction(
                        overdueDayRegistrations.map((r) => r.id),
                      );
                      if ("error" in result && result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success("Tickets vencidos eliminados de la lista");
                        router.refresh();
                      }
                    }}
                  >
                    No se borra el registro ni afecta lo cobrado — solo deja de aparecer acá,
                    como si se hubiera registrado la salida.
                  </ConfirmActionDialog>
                </div>
              )}

              <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
                {activeDayRegistrations.map((r) => {
                  const overdue = isDayRegistrationOverdue(r);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setOpenDayRegistrationId(r.id)}
                      className={cn(
                        "flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                        overdue
                          ? "border-destructive/40 bg-destructive/10 hover:bg-destructive/15"
                          : "border-border bg-gm-surface-2 hover:bg-gm-surface-3",
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-base font-semibold text-foreground truncate">
                          {r.vehiclePlateCustomer || "Sin patente"}
                        </span>
                        {overdue && (
                          <Badge variant="red" className="shrink-0">
                            Vencido
                          </Badge>
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {r.lastNameCustomer || "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No hay tickets por día/semana/mes activos.
            </p>
          )}

          {isAdmin && (
            <Link
              href="/admin/tickets"
              className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
              Administrar tickets
            </Link>
          )}
        </div>
      </div>

      <ActiveTicketDialog
        ticket={openTicket}
        registration={openRegistration}
        brackets={priceBrackets}
        schedule={schedule}
        open={openTicketId !== null}
        onOpenChange={(next) => { if (!next) setOpenTicketId(null); }}
      />

      <ActiveDayTicketDialog
        registration={openDayRegistration}
        open={openDayRegistrationId !== null}
        onOpenChange={(next) => { if (!next) setOpenDayRegistrationId(null); }}
      />

      <PaymentMethodDialog
        price={pendingPayment?.price ?? null}
        open={pendingPayment !== null}
        onOpenChange={(next) => { if (!next) setPendingPayment(null); }}
        onPick={(metodo) => setPaymentMethodAction(pendingPayment!.id, metodo)}
        onConfirmed={() => router.refresh()}
      />
    </>
  );
}
