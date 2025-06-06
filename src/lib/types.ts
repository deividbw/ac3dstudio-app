
export interface Filament {
  id: string;
  tipo: string; // Ex: PLA, ABS, PETG
  cor: string;
  densidade: number; // g/cm³, usado para calcular peso a partir do volume se necessário
  marcaId?: string; // ID da marca
  modelo?: string; // Ex: PLA+, Standard
  temperaturaBicoIdeal?: number; // em °C
  temperaturaMesaIdeal?: number; // em °C
  precoPorKg?: number; // R$/kg - RE-ADDED FOR COST CALCULATION
}

export interface Printer {
  id: string;
  nome: string;
  marcaId?: string; // ID da marca
  modelo?: string;
  custoAquisicao: number;
  consumoEnergiaHora: number; // kWh
  taxaDepreciacaoHora: number; // R$/hora
  custoEnergiaKwh: number; // R$/kWh
}

export interface ProductCost {
  materialCost: number;
  energyCost: number;
  depreciationCost: number;
  additionalCostEstimate: number;
  totalCost: number;
}

export interface Product {
  id:string;
  nome: string;
  descricao?: string;
  filamentoId: string;
  impressoraId: string;
  tempoImpressaoHoras: number;
  pesoGramas: number; // gramas
  imageUrl?: string;
  custoCalculado?: ProductCost;
}

export interface Brand {
  id: string;
  nome: string;
}
