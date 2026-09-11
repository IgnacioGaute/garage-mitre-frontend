"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { TicketPriceBracket } from "@/types/ticket-price-bracket.type";
import { TicketSchedule } from "@/services/tickets.service";
import ScannerButton from "../../components/scanner-button";
import { useTour, tourHighlight, tourTransition } from "./ticket-tour";
import {
  Car,
  Clock,
  CalendarDays,
  QrCode,
  CircleDollarSign,
  Timer,
  Settings,
} from "lucide-react";

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
  const [isScanning, setIsScanning] = useState(false);
  const [justScannedTicketId, setJustScannedTicketId] = useState<string | null>(null);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [openDayRegistrationId, setOpenDayRegistrationId] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ id: string; price: number } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"hourly" | "daily">("hourly");
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const hourlyTabRef = useRef<HTMLButtonElement>(null);
  const dailyTabRef = useRef<HTMLButtonElement>(null);
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const prevLatestIdRef = useRef<string | null>(null);
  const router = useRouter();
  const tour = useTour(TOUR_STEPS);

  const selectSidebarTab = (tab: "hourly" | "daily") => {
    if (tab === sidebarTab) return;
    setFlipDirection(tab === "daily" ? "next" : "prev");
    setSidebarTab(tab);
  };

  // Desliza el subrayado del tab activo hasta la posición real del botón — se mide en vez de
  // hardcodear anchos porque el texto (y el numerito de activos) cambia de tamaño.
  useLayoutEffect(() => {
    const el = sidebarTab === "hourly" ? hourlyTabRef.current : dailyTabRef.current;
    const row = tabsRowRef.current;
    if (!el || !row) return;
    const rowRect = row.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const left = elRect.left - rowRect.left;
    const width = elRect.width;
    // Bailar con la misma referencia si no cambió — si no, un objeto nuevo con los mismos
    // valores dispara otro render, que vuelve a medir, que vuelve a "cambiar" el objeto: loop.
    setUnderline((prev) => (prev.left === left && prev.width === width ? prev : { left, width }));
  });

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

  // Briefly pulse the sidebar chip for whatever ticket just landed a new registration.
  useEffect(() => {
    const currentId = latestRegistration?.id ?? null;
    const prevId = prevLatestIdRef.current;
    prevLatestIdRef.current = currentId;
    if (currentId && prevId && currentId !== prevId && latestRegistration) {
      const matched = ticketCatalog.find(
        (t) => t.id === latestRegistration.ticket?.id || t.codeBar === latestRegistration.codeBarTicket
      );
      if (matched) {
        setJustScannedTicketId(matched.id);
        const timer = setTimeout(() => setJustScannedTicketId(null), 2200);
        return () => clearTimeout(timer);
      }
    }
  }, [latestRegistration?.id]);

  const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDayTicket = latestRegistration?.ticket?.vehicleType;
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
  const openDayRegistration = openDayRegistrationId
    ? activeDayRegistrations.find((r) => r.id === openDayRegistrationId) ?? null
    : null;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="max-w-[1180px] mx-auto mb-5 lg:mb-7 short:mb-3">
        <nav className="flex items-center gap-1.5 gm-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2 short:mb-1">
          <span>Garage Mitre</span>
          <span className="opacity-50">/</span>
          <span>Operación</span>
          <span className="opacity-50">/</span>
          <span>Tickets</span>
        </nav>
        <div className="flex items-end justify-between gap-4 flex-wrap border-b border-border pb-4 short:pb-3">
          <div>
            <h1 className="gm-display text-[22px] sm:text-[26px] md:text-[30px] short:text-[24px] font-bold tracking-[0.01em] text-foreground">
              Registro de estacionamiento
            </h1>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-[520px]">
              Escaneá el código de barras del ticket para registrar entrada o salida del vehículo.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 gm-mono text-[11px] text-muted-foreground">
              <span
                className="h-[7px] w-[7px] rounded-full bg-[hsl(120_35%_55%)]"
                style={{ animation: "gm-blink 1.4s steps(2, jump-none) infinite" }}
              />
              Turno activo · {todayStr}
            </div>
            {tour.node}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto flex gap-5 lg:gap-7 flex-wrap items-start">
        {/* ── Main column ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 sm:min-w-[320px]">
          <div className="mb-5 short:mb-3">
            <ScannerButton
              isDialogOpen={isDialogOpen}
              onScanningChange={setIsScanning}
              onTicketRegistered={() => router.refresh()}
              onTicketExited={(registration) => setPendingPayment(registration)}
              scannerRef={(el) => tour.refFor("scanner")(el)}
              scannerStyle={tour.isActive("scanner") ? { ...tourTransition, ...tourHighlight } : tourTransition}
              manualRef={(el) => tour.refFor("manual")(el)}
              manualStyle={tour.isActive("manual") ? { ...tourTransition, ...tourHighlight } : tourTransition}
              extraActions={
                <div
                  ref={(el) => tour.refFor("dayTicket")(el)}
                  style={
                    tour.isActive("dayTicket")
                      ? { ...tourTransition, ...tourHighlight }
                      : tourTransition
                  }
                >
                  <CreateTicketRegistrationDialog setIsDialogOpen={setIsDialogOpen} />
                </div>
              }
            />
          </div>

          <div
            key={latestRegistration?.id ?? "empty"}
            ref={(el) => tour.refFor("ticket")(el)}
            style={{
              ...(tour.isActive("ticket") ? { ...tourTransition, ...tourHighlight } : tourTransition),
              animation: "gm-ticket-rise 560ms cubic-bezier(.2,.7,.3,1) both",
            }}
          >
            <div className="relative flex w-full flex-col sm:flex-row">
              {/* ── Main stub ── */}
              <div
                className="relative flex-1 min-w-0 p-6 sm:p-7 lg:p-9 short:p-6 overflow-hidden rounded-3xl sm:rounded-r-none border border-border bg-card/50 backdrop-blur-xl"
                style={isScanning ? { animation: "gm-barglow 950ms ease-in-out" } : undefined}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-gm-yellow/5 via-transparent to-gm-orange/5" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(100deg, transparent 40%, hsl(var(--gm-yellow) / 0.06) 50%, transparent 60%)",
                    backgroundSize: "250% 100%",
                    animation: "gm-bgsweep 5s ease-in-out infinite",
                  }}
                />
                <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gm-yellow blur-3xl opacity-[0.07]" />
                <div className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-gm-orange blur-3xl opacity-[0.07]" />

                <div className="relative z-10 flex h-full flex-col justify-between gap-5 lg:gap-7 short:gap-4">
                  <div className="space-y-4 short:space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="yellow">
                        <Car className="mr-1 h-3 w-3" />
                        {isDayTicket ? "TICKET X DÍA" : "TICKET X HORA"}
                      </Badge>
                      <span className="gm-mono text-xs text-muted-foreground">
                        #GM-{latestRegistration?.id?.slice(-4).toUpperCase() ?? "0000"}
                      </span>
                    </div>

                    <div>
                      <h2 className="gm-display text-3xl sm:text-4xl short:text-[28px] font-bold tracking-tight text-foreground">
                        Garage{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gm-yellow to-gm-orange">
                          Mitre
                        </span>
                      </h2>
                      <p className="mt-2 short:mt-1 text-[15px] text-muted-foreground">
                        Registro de estacionamiento
                      </p>
                    </div>
                  </div>

                  {latestRegistration ? (
                    isDayTicket ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              ENTRADA
                            </div>
                            <p className="text-foreground font-medium gm-mono gm-tnum">
                              {formatDate(latestRegistration.entryDay)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                              <Clock className="mr-2 h-4 w-4" />
                              HORARIO
                            </div>
                            <p className="text-foreground font-medium gm-mono gm-tnum">
                              {latestRegistration.entryTime}
                            </p>
                          </div>
                        </div>

                        {latestRegistration.description && (
                          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-4 short:p-3 backdrop-blur-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gm-yellow/30 bg-gm-yellow/10">
                              <Car className="h-5 w-5 text-gm-yellow" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {latestRegistration.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {latestRegistration.ticket?.vehicleType === "AUTO"
                                  ? "Automóvil"
                                  : "Camioneta"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground border-t border-border pt-3.5 w-full">
                          <span className="h-[7px] w-[7px] rounded-full shrink-0 bg-[hsl(200_60%_60%)] shadow-[0_0_8px_hsl(200_60%_60%/0.7)]" />
                          <span className="font-semibold tracking-[0.03em] uppercase text-foreground">ENTRADA</span>
                          registrada correctamente
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              SALIDA
                            </div>
                            <p className="text-foreground font-medium gm-mono gm-tnum">
                              {formatDate(latestRegistration.departureDay)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-muted-foreground text-sm">
                              <CircleDollarSign className="mr-2 h-4 w-4" />
                              PRECIO
                            </div>
                            <p className="text-foreground font-medium gm-mono gm-tnum text-xl">
                              ${latestRegistration.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-4 short:p-3 backdrop-blur-md">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gm-yellow/30 bg-gm-yellow/10">
                            <Timer className="h-5 w-5 text-gm-yellow" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                  Entrada
                                </p>
                                <p className="text-sm font-medium text-foreground gm-mono gm-tnum">
                                  {latestRegistration.entryTime}
                                </p>
                              </div>
                              <div className="h-px flex-1 bg-border" />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                  Salida
                                </p>
                                <p className="text-sm font-medium text-foreground gm-mono gm-tnum">
                                  {latestRegistration.departureTime}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground border-t border-border pt-3.5 w-full">
                          <span className="h-[7px] w-[7px] rounded-full shrink-0 bg-[hsl(120_35%_55%)] shadow-[0_0_8px_hsl(120_35%_55%/0.7)]" />
                          <span className="font-semibold tracking-[0.03em] uppercase text-foreground">SALIDA</span>
                          registrada correctamente
                        </div>
                      </>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card/40 mb-4">
                        <QrCode className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No hay registros disponibles.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Escaneá un código de barras para comenzar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Barcode stub ── */}
              <div
                className="relative flex w-full sm:w-[240px] shrink-0 flex-col items-center justify-center gap-5 short:gap-4 p-6 sm:p-7 short:p-5 rounded-3xl sm:rounded-l-none border border-border sm:border-l-0 bg-card/30 backdrop-blur-md"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(180deg, transparent 0 10px, hsl(var(--gm-line-strong) / 0.8) 10px 12px)",
                  backgroundSize: "2px 100%",
                  backgroundPosition: "left",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="relative w-full rounded-[14px] border border-border bg-gm-surface-2 p-4 short:p-3 shadow-lg overflow-hidden">
                  <div
                    className="h-16 short:h-14 w-full rounded"
                    style={{
                      backgroundColor: "#f2ead9",
                      backgroundImage:
                        "repeating-linear-gradient(90deg, hsl(var(--gm-ink)) 0 3px, transparent 3px 5px, hsl(var(--gm-ink)) 5px 6px, transparent 6px 10px, hsl(var(--gm-ink)) 10px 14px, transparent 14px 17px, hsl(var(--gm-ink)) 17px 19px, transparent 19px 24px)",
                    }}
                  />
                  {isScanning && (
                    <div
                      className="absolute left-4 right-4 top-4 h-[3px] rounded-full bg-gm-yellow"
                      style={{
                        boxShadow: "0 0 12px 2px hsl(var(--gm-yellow) / 0.9)",
                        animation: "gm-scanline 950ms linear",
                      }}
                    />
                  )}
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Código
                  </p>
                  <p className="gm-mono text-xl font-bold text-foreground gm-tnum">
                    {latestRegistration
                      ? isDayTicket
                        ? latestRegistration.ticket?.codeBar ?? "—"
                        : latestRegistration.codeBarTicket ?? "—"
                      : "—"}
                  </p>
                </div>

                {latestRegistration && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div
                      className="h-2 w-2 rounded-full bg-[hsl(120_35%_55%)]"
                      style={{ animation: "gm-blink 1.4s steps(2, jump-none) infinite" }}
                    />
                    <span>Registrado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar: vehicles currently parked ───────────────── */}
        <div
          ref={(el) => tour.refFor("occupancy")(el)}
          style={
            tour.isActive("occupancy")
              ? { ...tourTransition, ...tourHighlight }
              : tourTransition
          }
          className="w-full sm:w-[300px] shrink-0 rounded-[20px] border border-border bg-card/50 p-4 sm:p-5 sm:sticky sm:top-4"
        >
          <div
            className={cn(
              "mb-3 flex items-center gap-4 border-b border-border pb-3",
              isAdmin ? "justify-between" : "justify-end",
            )}
          >
            {isAdmin && (
              <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-gm-yellow"
              >
                <Settings className="size-3.5" />
                Administrar tickets
              </Link>
            )}
            <PriceBracketMapDialog brackets={priceBrackets} schedule={schedule} />
          </div>

          <div ref={tabsRowRef} className="relative flex items-center gap-6 border-b border-border">
            <button
              ref={hourlyTabRef}
              type="button"
              onClick={() => selectSidebarTab("hourly")}
              className={cn(
                "flex items-center gap-1.5 pb-2.5 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors",
                sidebarTab === "hourly" ? "text-gm-yellow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Por hora
              <span
                className={cn(
                  "gm-mono rounded-full px-1.5 py-px text-[9.5px] font-bold",
                  sidebarTab === "hourly" ? "bg-gm-yellow/15 text-gm-yellow" : "bg-gm-surface-3 text-muted-foreground",
                )}
              >
                {activeTickets.length}
              </span>
            </button>
            <button
              ref={dailyTabRef}
              type="button"
              onClick={() => selectSidebarTab("daily")}
              className={cn(
                "flex items-center gap-1.5 pb-2.5 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors",
                sidebarTab === "daily" ? "text-gm-yellow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Día/Sem/Mes
              <span
                className={cn(
                  "gm-mono rounded-full px-1.5 py-px text-[9.5px] font-bold",
                  sidebarTab === "daily" ? "bg-gm-yellow/15 text-gm-yellow" : "bg-gm-surface-3 text-muted-foreground",
                )}
              >
                {activeDayRegistrations.length}
              </span>
            </button>
            <span
              className="absolute -bottom-px h-[2px] rounded-full bg-gm-yellow transition-all duration-300 ease-out"
              style={{ left: underline.left, width: underline.width }}
            />
          </div>

          {/* Como pasar la hoja de un libro: la franja entrante gira sobre el borde por el que
              "entró" (izquierda si se avanzó a Día/Sem/Mes, derecha si se volvió a Por hora). */}
          <div className="mt-5" style={{ perspective: "1400px" }}>
            <div
              key={sidebarTab}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: flipDirection === "next" ? "left center" : "right center",
                animation: `${flipDirection === "next" ? "gm-page-flip-next" : "gm-page-flip-prev"} 480ms cubic-bezier(.25,.75,.35,1) both`,
              }}
            >
              {sidebarTab === "hourly" ? (
                <>
                  {sortedCatalog.length > 0 && (
                    <>
                      <div className="h-[6px] rounded-full bg-gm-surface-3 overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gm-yellow to-gm-orange transition-[width] duration-500 ease-out"
                          style={{ width: `${Math.round((activeTickets.length / sortedCatalog.length) * 100)}%` }}
                        />
                      </div>
                      <p className="mb-4 text-[11px] text-muted-foreground">
                        {Math.round((activeTickets.length / sortedCatalog.length) * 100)}% de los tickets circulando en el playón
                      </p>
                    </>
                  )}

                  {sortedCatalog.length > 0 ? (
                    <div className="grid grid-cols-5 gap-[7px] mb-4">
                      {sortedCatalog.map((t) => {
                        const active = isTicketActive(t, registrations);
                        const justScanned = t.id === justScannedTicketId;
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
                                : `Ticket ${t.codeBar} · inactivo`
                            }
                            style={justScanned ? { animation: "gm-chippulse 1.1s ease-in-out 2" } : undefined}
                            className={cn(
                              "h-[30px] rounded-[7px] grid place-items-center gm-mono text-[10px] font-bold border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              active
                                ? "text-gm-ink bg-gradient-to-br from-gm-yellow to-gm-orange border-gm-yellow/60 cursor-pointer hover:brightness-110 hover:shadow-[0_0_10px_hsl(var(--gm-yellow)/0.45)] active:translate-y-px"
                                : "text-muted-foreground bg-gm-surface-2 border-border cursor-default",
                            )}
                          >
                            {t.codeBar}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-border bg-gm-surface-2/40 p-4 text-center text-[12px] text-muted-foreground mb-4">
                      No hay tickets registrados.
                    </div>
                  )}

                  {activeTickets.length > 0 && (
                    <p className="-mt-2 mb-4 text-[11px] text-muted-foreground">
                      Tocá un ticket activo para ver desde cuándo está y su franja.
                    </p>
                  )}

                  <div className="flex flex-col gap-2 text-[11.5px] text-muted-foreground border-t border-border pt-3.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded shrink-0 bg-gm-yellow/85 shadow-[0_0_8px_hsl(var(--gm-yellow)/0.5)]" />
                      Activo · sin salida registrada
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded shrink-0 border border-border bg-gm-surface-2" />
                      Inactivo · con salida registrada
                    </div>
                  </div>
                </>
              ) : activeDayRegistrations.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {activeDayRegistrations.map((r) => {
                    const overdue = isDayRegistrationOverdue(r);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setOpenDayRegistrationId(r.id)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-[8px] border px-2.5 py-1.5 text-left transition-colors",
                          overdue
                            ? "border-destructive/40 bg-destructive/10 hover:bg-destructive/15"
                            : "border-gm-yellow/40 bg-gm-yellow/10 hover:bg-gm-yellow/20",
                        )}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span className="gm-mono text-[11.5px] font-bold text-foreground truncate">
                            {r.vehiclePlateCustomer || 'Sin patente'}
                          </span>
                          {overdue && (
                            <Badge variant="red" className="shrink-0 px-1.5 py-0 text-[9px]">
                              Vencido
                            </Badge>
                          )}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground shrink-0">
                          {r.lastNameCustomer || '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border bg-gm-surface-2/40 p-4 text-center text-[12px] text-muted-foreground">
                  No hay tickets por día/semana/mes activos.
                </div>
              )}
            </div>
          </div>
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
