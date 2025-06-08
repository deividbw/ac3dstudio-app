
"use server";

import type { EcommerceContactFormValues } from "@/lib/schemas";
import { EcommerceContactSchema } from "@/lib/schemas";

export async function submitEcommerceContactForm(
  values: EcommerceContactFormValues
): Promise<{ success: boolean; message: string; error?: string }> {
  const validation = EcommerceContactSchema.safeParse(values);
  if (!validation.success) {
    // Extrai a primeira mensagem de erro para simplificar, ou pode concatená-las.
    const firstError = validation.error.errors[0]?.message || "Dados inválidos.";
    return { success: false, message: firstError, error: firstError };
  }

  console.log("Nova mensagem de contato E-commerce recebida:");
  console.log("Nome Completo:", `${validation.data.nome} ${validation.data.sobrenome}`);
  console.log("Email:", validation.data.email);
  console.log("Telefone (WhatsApp):", validation.data.telefone);
  console.log("Mensagem:", validation.data.mensagem);

  // Simulação de um processo de envio (ex: enviar email, salvar no DB)
  // Em uma aplicação real, você integraria com um serviço de email ou backend aqui.
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da rede
    // Exemplo de como poderia ser um envio real (comentado):
    // await sendEmail({ to: 'seu-email@exemplo.com', subject: 'Novo Contato E-commerce', body: ... });
    return { success: true, message: "Sua mensagem foi enviada com sucesso! Entraremos em contato em breve." };
  } catch (e: any) {
    console.error("Falha ao processar formulário de contato:", e);
    return { success: false, message: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.", error: e.message };
  }
}
