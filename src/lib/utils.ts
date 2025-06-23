import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const colorMap: { [key: string]: string } = {
  // Mapeamento de cores básicas em português para códigos hex
  "preto": "#000000",
  "branco": "#FFFFFF",
  "cinza": "#808080",
  "vermelho": "#FF0000",
  "verde": "#008000",
  "azul": "#0000FF",
  "amarelo": "#FFFF00",
  "laranja": "#FFA500",
  "roxo": "#800080",
  "rosa": "#FFC0CB",
  "marrom": "#A52A2A",
  "prata": "#C0C0C0",
  "dourado": "#FFD700",
  
  // Adicione variações comuns
  "vermelho translúcido": "#FF0000",
  "azul claro": "#ADD8E6",
  "verde limão": "#32CD32",
};

export function getColorCode(colorName?: string | null): string {
  if (!colorName) {
    return '#FFFFFF'; // Retorna branco como padrão se a cor não existir
  }

  const lowerCaseColor = colorName.toLowerCase();
  
  // Se for um código hex válido, retorna ele mesmo
  if (/^#[0-9A-F]{6}$/i.test(lowerCaseColor)) {
    return lowerCaseColor;
  }
  
  // Procura no mapa de cores
  return colorMap[lowerCaseColor] || colorName; 
}
