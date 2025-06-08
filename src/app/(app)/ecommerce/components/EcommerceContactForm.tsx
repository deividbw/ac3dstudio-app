
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { EcommerceContactFormValues } from "@/lib/schemas";
import { EcommerceContactSchema } from "@/lib/schemas";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export function EcommerceContactForm() {
  const { toast } = useToast();
  const form = useForm<EcommerceContactFormValues>({
    resolver: zodResolver(EcommerceContactSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      telefone: "",
      mensagem: "",
    },
  });

  async function onSubmit(values: EcommerceContactFormValues) {
    // Simulação de envio
    console.log("Dados do formulário de contato:", values);
    toast({
      title: "Mensagem Enviada!",
      description: "Recebemos sua mensagem e entraremos em contato em breve.",
      variant: "success",
    });
    form.reset(); // Limpa o formulário após o envio
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome*</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sobrenome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome*</FormLabel>
                <FormControl>
                  <Input placeholder="Seu sobrenome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (WhatsApp)*</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(00) 90000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mensagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o que você precisa ou sua dúvida..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto">
          <Send className="mr-2 h-4 w-4" />
          Enviar Mensagem
        </Button>
      </form>
    </Form>
  );
}
