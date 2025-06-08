
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Orcamento, OrcamentoItem } from "@/lib/types";
import { OrcamentoSchema } from "@/lib/schemas";
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos para itens

let mockOrcamentos: Orcamento[] = [
    {
        id: "orc_1",
        nomeOrcamento: "Projeto Inicial Cliente X",
        clienteNome: "Empresa X",
        dataCriacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        status: "Aprovado",
        itens: [
            { id: uuidv4(), produtoId: "prod_1", produtoNome: "Suporte Articulado para Celular", quantidade: 2, valorUnitario: 46.63, valorTotalItem: 93.26 }
        ],
        valorTotalCalculado: 93.26,
        observacao: "Entrega urgente."
    },
    {
        id: "orc_2",
        nomeOrcamento: "Peças Reposição Y",
        clienteNome: "Indústria Y",
        dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        status: "Pendente",
        itens: [
            { id: uuidv4(), produtoId: "prod_1", produtoNome: "Suporte Articulado para Celular", quantidade: 5, valorUnitario: 46.63, valorTotalItem: 233.15 },
            // Supondo que prod_2 tenha um custoDetalhado.precoVendaCalculado de, digamos, 60
            // { id: uuidv4(), produtoId: "prod_2", produtoNome: "Vaso Decorativo Geométrico", quantidade: 1, valorUnitario: 60.00, valorTotalItem: 60.00 }
        ],
        valorTotalCalculado: 233.15, // 233.15 + 60 = 293.15
        observacao: "Verificar dimensões."
    }
];

export async function getOrcamentos(): Promise<Orcamento[]> {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockOrcamentos)); // Return a deep copy
}

export async function getOrcamentoById(id: string): Promise<Orcamento | undefined> {
  const orcamento = mockOrcamentos.find(o => o.id === id);
  return orcamento ? JSON.parse(JSON.stringify(orcamento)) : undefined;
}

export async function createOrcamento(data: Omit<Orcamento, 'id' | 'dataCriacao' | 'valorTotalCalculado' | 'itens'> & { itens: Omit<OrcamentoItem, 'id' | 'produtoNome' | 'valorTotalItem'>[] } ): Promise<{ success: boolean, orcamento?: Orcamento, error?: string }> {
  
  const produtosImportados = await import('@/lib/actions/product.actions');
  const allProducts = await produtosImportados.getProducts();

  const processedItems: OrcamentoItem[] = [];
  const itemProcessingErrors: string[] = [];

  for (const item of data.itens) {
    const productDetails = allProducts.find(p => p.id === item.produtoId);
    if (!productDetails || !productDetails.custoDetalhado?.precoVendaCalculado || productDetails.custoDetalhado.precoVendaCalculado <= 0) {
      itemProcessingErrors.push(`Produto "${productDetails?.nome || `ID ${item.produtoId}`}" não encontrado ou sem preço de venda definido.`);
      continue; 
    }
    processedItems.push({
        id: uuidv4(),
        produtoId: item.produtoId,
        produtoNome: productDetails.nome,
        quantidade: item.quantidade,
        valorUnitario: productDetails.custoDetalhado.precoVendaCalculado,
        valorTotalItem: item.quantidade * productDetails.custoDetalhado.precoVendaCalculado,
    });
  }

  if (itemProcessingErrors.length > 0 && processedItems.length === 0) {
    // Se todos os itens tiveram erro
    return { success: false, error: `Erro ao processar itens do orçamento: ${itemProcessingErrors.join('; ')}` };
  }
  
  if (processedItems.length === 0 && data.itens.length > 0) {
     // Se havia itens na entrada, mas nenhum foi processado com sucesso (poderia acontecer se todos tivessem erro)
    return { success: false, error: "Nenhum item válido pôde ser adicionado ao orçamento. Verifique os produtos selecionados." };
  }

   if (processedItems.length === 0) {
    // Se não havia itens na entrada ou nenhum item válido foi processado.
    return { success: false, error: "O orçamento deve conter pelo menos um item válido." };
  }


  const valorTotalCalculado = processedItems.reduce((sum, item) => sum + item.valorTotalItem, 0);
  
  const orcamentoToValidate = {
    ...data,
    itens: processedItems,
    valorTotalCalculado,
    dataCriacao: new Date().toISOString(),
  };

  const validation = OrcamentoSchema.safeParse(orcamentoToValidate);
  if (!validation.success) {
    console.error("Erro de validação ao criar orçamento:", validation.error.flatten().fieldErrors);
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }
  
  const newOrcamento: Orcamento = {
    ...validation.data,
    id: `orc_${String(Date.now())}`,
  };

  mockOrcamentos.push(newOrcamento);
  
  // Se houve erros parciais mas alguns itens foram processados, podemos retornar sucesso com um aviso.
  // Por simplicidade aqui, se itemProcessingErrors tem algo mas processedItems também tem, consideramos sucesso parcial.
  // Para um retorno mais granular, poderia adicionar uma propriedade 'warnings' ao objeto de retorno.
  if (itemProcessingErrors.length > 0) {
      return { 
          success: true, 
          orcamento: JSON.parse(JSON.stringify(newOrcamento)), 
          error: `Orçamento criado, mas com avisos: ${itemProcessingErrors.join('; ')}` // Usando 'error' para aviso aqui
        };
  }

  return { success: true, orcamento: JSON.parse(JSON.stringify(newOrcamento)) };
}

export async function updateOrcamento(id: string, data: Partial<Omit<Orcamento, 'id' | 'dataCriacao' | 'valorTotalCalculado' | 'itens'>> & { itens?: Partial<Omit<OrcamentoItem, 'id' | 'produtoNome' | 'valorTotalItem'>>[] }): Promise<{ success: boolean, orcamento?: Orcamento, error?: string }> {
  const existingOrcamentoIndex = mockOrcamentos.findIndex(o => o.id === id);
  if (existingOrcamentoIndex === -1) {
    return { success: false, error: "Orçamento não encontrado" };
  }

  const produtosImportados = await import('@/lib/actions/product.actions');
  const allProducts = await produtosImportados.getProducts();
  
  const existingOrcamento = mockOrcamentos[existingOrcamentoIndex];
  
  let processedItems: OrcamentoItem[];
  const itemProcessingErrors: string[] = [];

  if (data.itens) {
    processedItems = [];
    for (const item of data.itens) {
        if (!item.produtoId || !item.quantidade) { // Validação básica
            itemProcessingErrors.push(`Item inválido fornecido para atualização: ID ${item.produtoId}, Qtd ${item.quantidade}`);
            continue;
        }
        const productDetails = allProducts.find(p => p.id === item.produtoId);
        if (!productDetails || !productDetails.custoDetalhado?.precoVendaCalculado || productDetails.custoDetalhado.precoVendaCalculado <=0) {
            itemProcessingErrors.push(`Produto "${productDetails?.nome || item.produtoId}" não encontrado ou sem preço definido para atualização.`);
            continue;
        }
        const existingItem = existingOrcamento.itens.find(ei => ei.produtoId === item.produtoId);

        processedItems.push({
            id: existingItem?.id || uuidv4(),
            produtoId: item.produtoId!,
            produtoNome: productDetails.nome,
            quantidade: item.quantidade!,
            valorUnitario: productDetails.custoDetalhado.precoVendaCalculado,
            valorTotalItem: item.quantidade! * productDetails.custoDetalhado.precoVendaCalculado,
        });
    }
    // Se todos os itens fornecidos para atualização tiveram erro, mas havia itens antes, manter os antigos?
    // Ou retornar erro? Por ora, se processedItems ficar vazio e data.itens tinha algo, será um erro.
    if (data.itens.length > 0 && processedItems.length === 0 && itemProcessingErrors.length > 0) {
        return { success: false, error: `Erro ao atualizar itens: ${itemProcessingErrors.join('; ')}` };
    }
     if (processedItems.length === 0 && data.itens && data.itens.length > 0) {
        return { success: false, error: "Nenhum item válido pôde ser atualizado no orçamento." };
    }
  } else {
    processedItems = existingOrcamento.itens; 
  }
  
   if (processedItems.length === 0) {
    return { success: false, error: "O orçamento deve conter pelo menos um item válido para ser atualizado." };
  }

  const valorTotalCalculado = processedItems.reduce((sum, item) => sum + item.valorTotalItem, 0);

  const mergedData = {
    ...existingOrcamento,
    ...data,
    itens: processedItems,
    valorTotalCalculado,
  };

  const validation = OrcamentoSchema.safeParse(mergedData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }

  const finalData = validation.data as Orcamento;
  mockOrcamentos[existingOrcamentoIndex] = finalData;

  if (itemProcessingErrors.length > 0) {
      return { 
          success: true, 
          orcamento: JSON.parse(JSON.stringify(finalData)),
          error: `Orçamento atualizado, mas com avisos: ${itemProcessingErrors.join('; ')}`
      };
  }

  return { success: true, orcamento: JSON.parse(JSON.stringify(finalData)) };
}


export async function deleteOrcamento(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockOrcamentos.length;
  mockOrcamentos = mockOrcamentos.filter(o => o.id !== id);
  if (mockOrcamentos.length === initialLength) {
    return { success: false, error: "Orçamento não encontrado" };
  }
  return { success: true };
}
