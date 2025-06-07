
"use client";

import type { Orcamento, OrcamentoStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, CalendarDays, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrcamentoCardProps {
  orcamento: Orcamento;
  onEdit: (orcamento: Orcamento) => void;
  onDeleteRequest: (orcamentoId: string) => void; // Renomeado para evitar conflito com prop 'onDelete' de alguns elementos
}

export function OrcamentoCard({ orcamento, onEdit, onDeleteRequest }: OrcamentoCardProps) {
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadgeColorClass = (status: OrcamentoStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500 text-yellow-50 hover:bg-yellow-500/90';
      case 'Aprovado': return 'bg-green-600 text-green-50 hover:bg-green-600/90';
      case 'Rejeitado': return 'bg-red-600 text-red-50 hover:bg-red-600/90';
      case 'Concluído': return 'bg-blue-600 text-blue-50 hover:bg-blue-600/90';
      default: return 'bg-gray-500 text-gray-50 hover:bg-gray-500/90';
    }
  };

  return (
    <Card className="shadow-lg w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary/80" />
            {orcamento.nomeOrcamento}
          </CardTitle>
          <Badge className={cn("text-xs", getStatusBadgeColorClass(orcamento.status))}>
            {orcamento.status}
          </Badge>
        </div>
        <CardDescription className="text-xs pt-1">ID: {orcamento.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Cliente: <strong>{orcamento.clienteNome}</strong></span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Data: <strong>{formatDate(orcamento.dataCriacao)}</strong></span>
        </div>
        <div className="flex items-center pt-1">
          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
          <span className="font-semibold">Valor Total: <strong className="text-green-600">{formatCurrency(orcamento.valorTotalCalculado)}</strong></span>
        </div>
        {orcamento.observacao && (
          <p className="text-xs text-muted-foreground pt-2 border-t mt-2">
            <span className="font-medium">Obs:</span> {orcamento.observacao}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 border-t pt-4 mt-auto">
        <Button variant="outline" size="sm" onClick={() => onEdit(orcamento)} className="h-8 text-xs">
          <Edit className="mr-1.5 h-3.5 w-3.5" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDeleteRequest(orcamento.id)} className="h-8 text-xs">
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
