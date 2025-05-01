import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ticketRegistrationForDaySchema, TicketRegistrationForDaySchemaType } from "@/schemas/ticket-registration-for-day.schema";
import { createTicketRegistrationForDayAction } from "@/actions/tickets/create-ticket-registration-for-day.action";

export function CreateTicketRegistrationDialog({ setIsDialogOpen }: { setIsDialogOpen: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketType, setTicketType] = useState<'days' | 'weeks'>('days'); // Estado para manejar el tipo de selección

  const form = useForm<TicketRegistrationForDaySchemaType>({
    resolver: zodResolver(ticketRegistrationForDaySchema),
    defaultValues: {
      days: 0,
      weeks: 0,
      price: undefined,
    },
  });

  const onSubmit = async (values: TicketRegistrationForDaySchemaType) => {
    await createTicketRegistrationForDayAction(values);
    toast.success("Ticket creado exitosamente");
    setIsOpen(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="text-center mt-4">
      <p
        className="text-gray-600 hover:text-white cursor-pointer underline"
        onClick={() => {
          setIsOpen(true);
          setIsDialogOpen(true);
        }}
      >
        Crear Ticket Por Día/semana
      </p>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
          <DialogHeader className="items-center">
            <DialogTitle>Crear Ticket Por Día/semana</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Select para elegir entre Día o Semana */}
              <FormItem>
                <FormLabel>Seleccione Tipo de Ticket</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => setTicketType(value as 'days' | 'weeks')} // Cambia el tipo de ticket
                    defaultValue={ticketType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Días</SelectItem>
                      <SelectItem value="weeks">Semanas</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Campo para días */}
              {ticketType === 'days' && (
                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccione la Cantidad de Días</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={String(field.value) || '1'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione dias" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48 overflow-y-auto">
                            {[1, 2, 3, 4, 5, 6].map((days) => (
                              <SelectItem key={days} value={String(days)}>
                                {days} dia/s
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Campo para semanas */}
              {ticketType === 'weeks' && (
                <FormField
                  control={form.control}
                  name="weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccione la Cantidad de Semanas</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={String(field.value) || '1'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione semanas" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48 overflow-y-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((weeks) => (
                              <SelectItem key={weeks} value={String(weeks)}>
                                {weeks} semana/s
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Ticket</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit">
                Crear Ticket
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
