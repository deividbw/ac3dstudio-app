export interface Filament {
  id: string;
  tipo: string;
  cor: string;
  precoPorKg: number;
  densidade: number; // g/cm³
}

export interface Printer {
  id: string;
  nome: string;
  custoAquisicao: number;
  consumoEnergiaHora: number; // kWh
  taxaDepreciacaoHora: number; // R$/hora
  custoEnergiaKwh: number; // R$/kWh
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

export interface ProductCost {
  materialCost: number;
  energyCost: number;
  depreciationCost: number;
  additionalCostEstimate: number;
  totalCost: number;
}
