
export interface Filament {
  id: string;
  tipo: string; // Ex: PLA, ABS, PETG
  cor: string;
  densidade: number; // g/cm³, usado para calcular peso a partir do volume se necessário

  marca?: string;
  modelo?: string; // Ex: PLA+, Standard
  temperaturaBicoIdeal?: number; // em °C
  temperaturaMesaIdeal?: number; // em °C
}

export interface Printer {
  id: string;
  nome: string;
  marca?: string;
  modelo?: string;
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

