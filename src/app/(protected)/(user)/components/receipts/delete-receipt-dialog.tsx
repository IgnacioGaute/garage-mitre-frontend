'use client';

import { useState, useTransition } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Receipt } from '@/types/receipt.type';
import { deleteReceiptSchema, DeleteReceiptSchemaType } from '@/schemas/receipt.schema';
import { deleteReceiptAction } from '@/actions/receipts/delete-receipt.action';

const DELETE_RECEIPT_TEXT = 'Eliminar recibo';

export function DeleteReceiptDialog({ receipt }: { receipt: Receipt }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DeleteReceiptSchemaType>({
    resolver: zodResolver(deleteReceiptSchema),
    defaultValues: {
      confirmation: '',
    },
  });


  const onSubmit = (values: DeleteReceiptSchemaType) => {
      startTransition(async () => {
        const data = await deleteReceiptAction(receipt.id);
      
        if ('error' in data) {
          toast.error(data.error.message);
        } else {
          toast.success('Recibo eliminado exitosamente');
          form.reset();
          setOpen(false);
        }
      });
    };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Eliminar Recibo
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Recibo</DialogTitle>
            <DialogDescription>
              Ingrese {DELETE_RECEIPT_TEXT} para confirmar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmación</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder={DELETE_RECEIPT_TEXT}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isPending}
                >
                  Eliminar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}


