
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

  const processedItems: OrcamentoItem[] = data.itens.map(item => {
    const productDetails = allProducts.find(p => p.id === item.produtoId);
    if (!productDetails || !productDetails.custoDetalhado?.precoVendaCalculado) {
        // Lançar erro ou tratar caso o produto não seja encontrado ou não tenha preço
        throw new Error(`Produto com ID ${item.produtoId} não encontrado ou sem preço definido.`);
    }
    return {
        id: uuidv4(),
        produtoId: item.produtoId,
        produtoNome: productDetails.nome,
        quantidade: item.quantidade,
        valorUnitario: productDetails.custoDetalhado.precoVendaCalculado,
        valorTotalItem: item.quantidade * productDetails.custoDetalhado.precoVendaCalculado,
    };
  });

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
  if (data.itens) {
    processedItems = data.itens.map(item => {
        const productDetails = allProducts.find(p => p.id === item.produtoId);
        if (!productDetails || !productDetails.custoDetalhado?.precoVendaCalculado) {
            throw new Error(`Produto com ID ${item.produtoId} não encontrado ou sem preço definido para atualização.`);
        }
        // Se o item já existe no orçamento, mantém o ID, senão gera um novo.
        const existingItem = existingOrcamento.itens.find(ei => ei.produtoId === item.produtoId);

        return {
            id: existingItem?.id || uuidv4(),
            produtoId: item.produtoId!,
            produtoNome: productDetails.nome,
            quantidade: item.quantidade!,
            valorUnitario: productDetails.custoDetalhado.precoVendaCalculado,
            valorTotalItem: item.quantidade! * productDetails.custoDetalhado.precoVendaCalculado,
        };
    });
  } else {
    processedItems = existingOrcamento.itens; // Mantém os itens existentes se não forem fornecidos novos
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
