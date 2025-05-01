"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTransition, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateAmountCustomerAction } from "@/actions/customers/update-amount-customer.action";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { amountCustomerSchema, AmountCustomerSchemaType } from "@/schemas/amount-customer.schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";

export default function UpdateAmountCustomerCard({ className }: { className?: string }) {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [isNegative, setIsNegative] = useState<boolean>(false);

    const form = useForm<AmountCustomerSchemaType>({
        resolver: zodResolver(amountCustomerSchema),
        defaultValues: {
            amount: undefined,
            customerType: 'OWNER',
            ownerTypeOfRenter: '',
        },
    });

    const customerType = form.watch('customerType'); // 🔥 Observa el cambio de customerType

    const onSubmit = (values: AmountCustomerSchemaType) => {
        setError(undefined);
        setSuccess(undefined);

        const finalAmount = isNegative ? -Math.abs(values.amount) : Math.abs(values.amount);

        startTransition(() => {
            updateAmountCustomerAction({ ...values, amount: finalAmount })
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                        toast.error(data.error);
                    } else {
                        setSuccess(data.success);
                        toast.success('Montos actualizados exitosamente');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setError('Error al actualizar el monto');
                    toast.error(error.message || 'Error desconocido');
                });
        });
    };

    return (
        <Card className={`w-3/5 h-full flex flex-col ${className} mx-auto my-auto justify-center`}>
            <CardHeader>
                <CardTitle>Gestionar Monto de los clientes</CardTitle>
                <CardDescription>Elegir tipo de cliente y si el monto va a ser negativo o positivo</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col h-full">
                        <FormField
                            control={form.control}
                            name="customerType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Cliente</FormLabel>
                                    <FormControl>
                                        <Select
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OWNER">Propietario</SelectItem>
                                                <SelectItem value="RENTER">Inquilino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Si es RENTER mostramos otro select */}
                        {customerType === 'RENTER' && (
                            <FormField
                                control={form.control}
                                name="ownerTypeOfRenter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Dueño</FormLabel>
                                        <FormControl>
                                            <Select
                                                disabled={isPending}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un dueño" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GARAGE_MITRE">Garage Mitre</SelectItem>
                                                    <SelectItem value="OWNER">Propietario</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                            <div className="flex items-center justify-between">
                            <FormLabel>Convertir en negativo</FormLabel>
                            <div className={`p-1 rounded-full ${isNegative ? 'bg-red-700' : 'bg-black'} transition-colors`}>
                                <Switch
                                checked={isNegative}
                                onCheckedChange={setIsNegative}
                                disabled={isPending}
                                />
                            </div>
                            </div>


                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ingrese el monto</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} {...field} type="number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex-grow"></div>

                        <Button className="w-full mt-auto" type="submit" disabled={isPending}>
                            Guardar cambios
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
