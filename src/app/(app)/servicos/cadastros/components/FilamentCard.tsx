
"use client";

import type { Filament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Type, Palette, Thermometer, Scale, CircleDollarSign, AppWindow } from "lucide-react"; // Added AppWindow for Modelo
import { Badge } from "@/components/ui/badge";

interface FilamentCardProps {
  filament: Filament;
  onEdit: (filament: Filament) => void;
  onDelete: (filamentId: string) => void;
}

export function FilamentCard({ filament, onEdit, onDelete }: FilamentCardProps) {
  const custoPorGrama = (filament.precoRolo && filament.pesoRoloGramas && filament.pesoRoloGramas > 0) 
    ? (filament.precoRolo / filament.pesoRoloGramas) 
    : (filament.precoPorKg && filament.precoPorKg > 0 ? filament.precoPorKg / 1000 : 0);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatNumber = (value: number | undefined) => {
     if (value === undefined) return "N/A";
     return value.toLocaleString('pt-BR');
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-primary flex justify-between items-center">
          <span>{filament.marca || "Filamento"} {filament.modelo || filament.tipo}</span>
          <Badge variant="secondary">{filament.tipo}</Badge>
        </CardTitle>
        <CardDescription>Cor: {filament.cor}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {filament.marca && (
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Marca: <strong>{filament.marca}</strong></span>
          </div>
        )}
        {filament.modelo && (
          <div className="flex items-center">
            <AppWindow className="h-4 w-4 mr-2 text-muted-foreground" /> {/* Changed icon for Modelo */}
            <span>Modelo: <strong>{filament.modelo}</strong></span>
          </div>
        )}
         <div className="flex items-center">
          <Palette className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Cor: <strong>{filament.cor}</strong></span>
        </div>
        <div className="flex items-center">
          <Type className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Tipo: <strong>{filament.tipo}</strong> ({filament.densidade} g/cm³)</span>
        </div>
        {(filament.temperaturaBicoIdeal || filament.temperaturaMesaIdeal) && (
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              Bico: <strong>{filament.temperaturaBicoIdeal ? `${filament.temperaturaBicoIdeal}°C` : "N/A"}</strong> | 
              Mesa: <strong>{filament.temperaturaMesaIdeal ? `${filament.temperaturaMesaIdeal}°C` : "N/A"}</strong>
            </span>
          </div>
        )}
        {(filament.pesoRoloGramas || filament.precoRolo) && (
          <div className="flex items-center">
            <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              Rolo: <strong>{formatNumber(filament.pesoRoloGramas)}g</strong> | 
              Valor: <strong>{formatCurrency(filament.precoRolo)}</strong>
            </span>
          </div>
        )}
        <div className="flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
          <span className="font-semibold">
            Custo/g: <strong className="text-primary">{formatCurrency(custoPorGrama)}</strong>
          </span>
        </div>
         {filament.precoPorKg && filament.precoPorKg > 0 && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CircleDollarSign className="h-3 w-3 mr-1.5" />
            <span>Preço Direto/Kg: {formatCurrency(filament.precoPorKg)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(filament)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(filament.id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
