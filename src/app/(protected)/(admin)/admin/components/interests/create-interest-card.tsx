"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTransition, useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interestSchema, InterestSchemaType } from "@/schemas/interest-schema";
import { Interest } from "@/types/interest.type";
import { toast } from "sonner";
import { createInterestAction } from "@/actions/customers/create-interest.action";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function CardInterest({ className }: { className?: string }) {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    
    const [currentInterestOwner, setCurrentInterestOwner] = useState<number>(0);
    const [currentInterestRenter, setCurrentInterestRenter] = useState<number>(0);

    const form = useForm<InterestSchemaType>({
        resolver: zodResolver(interestSchema),
        defaultValues: {
            interestOwner: 0,
            interestRenter: 0
        },
    });

    const onSubmit = (values: InterestSchemaType) => {
        setError(undefined);
        setSuccess(undefined);

        startTransition(() => {
            createInterestAction(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                        toast.error(data.error);
                    } else {
                        setSuccess(data.success);
                        toast.success('Intereses creados exitosamente');

                        setCurrentInterestOwner(values.interestOwner);
                        setCurrentInterestRenter(values.interestRenter);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setError('Error al crear intereses');
                    toast.error(error.message || 'Error desconocido');
                });
        });
    };

    return (
        <Card className={`w-full h-full min-h-full flex flex-col ${className}`}>
            <CardHeader>
                <CardTitle>Gestionar intereses de los inquilinos y propietarios</CardTitle>
                <CardDescription>El número de intereses que escribas se suma cada 10 días. El interes se aplica a los clientes que se excedan de los 10 dias despues del dia 1 de cada mes.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col h-full">
                        <FormField
                            control={form.control}
                            name="interestOwner"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        Intereses Propietarios 
                                        <span className="text-green-600 flex items-center gap-1">
                                            {currentInterestOwner}
                                            <ArrowUp className="w-4 h-4 text-green-600" />
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="interestRenter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        Intereses Inquilinos 
                                        <span className="text-green-600 flex items-center gap-1">
                                            {currentInterestRenter}
                                            <ArrowUp className="w-4 h-4 text-green-600" />
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} {...field} />
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
