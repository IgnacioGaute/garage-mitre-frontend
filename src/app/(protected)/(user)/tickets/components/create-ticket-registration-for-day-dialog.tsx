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

  const form = useForm<TicketRegistrationForDaySchemaType>({
    resolver: zodResolver(ticketRegistrationForDaySchema),
    defaultValues: {
      days: 0,
      price: 0,
    },
  });

  const onSubmit = async (values: TicketRegistrationForDaySchemaType) => {
    await createTicketRegistrationForDayAction(values);
    toast.success("Ticket creado exitosamente");
    setIsOpen(false);
    setIsDialogOpen(false); // 🔴 Importante: cerrar estado del Dialog en el padre
  };

  return (
    <div className="text-center mt-4">
      <p
        className="text-gray-600 hover:text-white cursor-pointer underline"
        onClick={() => {
          setIsOpen(true);
          setIsDialogOpen(true); // 🔴 Activamos estado del Dialog en el padre
        }}
      >
        Crear Ticket Por Día
      </p>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          setIsDialogOpen(open); // 🔴 Sincronizar estado con el padre
        }}
      >
        <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
          <DialogHeader className="items-center">
            <DialogTitle>Crear Ticket Por Día</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccione la Cantidad de Días</FormLabel>
                    <FormControl>
                      <Select
                        disabled={false}
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione días" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48 overflow-y-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 10, 15, 30].map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day} días
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Ticket por Día</FormLabel>
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
