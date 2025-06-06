
export interface Filament {
  id: string;
  tipo: string; // Ex: PLA, ABS, PETG
  cor: string;
  precoPorKg: number; // Preço de compra do filamento por Kg
  densidade: number; // g/cm³, usado para calcular peso a partir do volume se necessário

  // Novos campos baseados na imagem
  marca?: string;
  modelo?: string; // Ex: PLA+, Standard
  temperaturaBicoIdeal?: number; // em °C
  temperaturaMesaIdeal?: number; // em °C
  // Para cálculo de custo por grama, pode ser útil ter um peso/valor de referência do rolo
  pesoRoloGramas?: number; // Peso do rolo padrão, ex: 1000g
  precoRolo?: number; // Preço do rolo padrão
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

