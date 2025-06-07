
export interface Filament {
  id: string;
  tipo: string; // Ex: PLA, ABS, PETG
  cor: string;
  densidade: number; // g/cm³, usado para calcular peso a partir do volume se necessário
  marcaId?: string; // ID da marca
  modelo?: string; // Ex: PLA+, Standard
  temperaturaBicoIdeal?: number; // em °C
  temperaturaMesaIdeal?: number; // em °C
  precoPorKg?: number; // R$/kg - Essencial para o cálculo de custo do material
  quantidadeEstoqueGramas?: number; // Nova propriedade para quantidade em estoque
}

export interface Printer {
  id: string;
  // nome?: string; // Made optional, then removed from display
  marcaId?: string; // ID da marca
  modelo?: string;
  custoAquisicao: number;
  consumoEnergiaHora: number; // kWh
  taxaDepreciacaoHora: number; // R$/hora - Custo por hora da impressora (depreciação)
  custoEnergiaKwh: number; // R$/kWh - Custo da energia
  vidaUtilAnos: number;
  horasTrabalhoDia: number; // Novo campo
}

// Nova estrutura para o detalhamento do custo e preço do produto
export interface ProductCostBreakdown {
  custoMaterialCalculado: number;
  custoImpressaoCalculado: number; // Combina depreciação e energia
  // custoModelagem e custosExtras vêm diretamente do Product, mas são listados aqui para clareza no cálculo total
  custoTotalProducaoCalculado: number; // Soma de material, impressão, modelagem, extras
  // margemLucroPercentual vem diretamente do Product
  lucroCalculado: number;
  precoVendaCalculado: number;
}

export interface Product {
  id:string;
  nome: string;
  descricao?: string;
  filamentoId: string; // Obrigatório para cálculo
  impressoraId: string; // Obrigatório para cálculo
  tempoImpressaoHoras: number; // Obrigatório para cálculo
  pesoGramas: number; // gramas - Obrigatório para cálculo
  imageUrl?: string;

  // Novos campos de entrada para o formulário
  custoModelagem: number; // Alterado de opcional para obrigatório com default no schema
  custosExtras: number; // Alterado de opcional para obrigatório com default no schema
  margemLucroPercentual: number; // Alterado de opcional para obrigatório com default no schema

  custoDetalhado?: ProductCostBreakdown; // Armazena todos os valores calculados
}

export interface Brand {
  id: string;
  nome: string;
}

