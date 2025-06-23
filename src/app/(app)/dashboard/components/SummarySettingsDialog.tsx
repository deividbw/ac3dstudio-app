
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SummaryCardConfig } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ALL_SUMMARY_CARDS_CONFIG } from '@/lib/constants';

interface DialogSummaryCardConfig extends SummaryCardConfig {
  visible: boolean;
}

interface SummaryconfiguracoesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentconfiguracoes: DialogSummaryCardConfig[];
  onSave: (updatedconfiguracoes: DialogSummaryCardConfig[]) => void;
}

export function SummaryconfiguracoesDialog({
  isOpen,
  onOpenChange,
  currentconfiguracoes,
  onSave,
}: SummaryconfiguracoesDialogProps) {
  const [localconfiguracoes, setLocalconfiguracoes] = useState<DialogSummaryCardConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      let newLocalconfiguracoes: DialogSummaryCardConfig[] = [];

      // 1. Process currentconfiguracoes, keeping their order and visibility,
      //    refreshing static data, and filtering out stale items.
      currentconfiguracoes.forEach(userSetting => {
        const originalCardConfig = ALL_SUMMARY_CARDS_CONFIG.find(c => c.id === userSetting.id);
        if (originalCardConfig) { // Only include if it's still a valid card
          newLocalconfiguracoes.push({
            // Static properties from original config
            id: originalCardConfig.id,
            title: originalCardConfig.title,
            icon: originalCardConfig.icon, // Crucial: always take icon from original
            iconBgColor: originalCardConfig.iconBgColor,
            iconTextColor: originalCardConfig.iconTextColor,
            mainValueColorClass: originalCardConfig.mainValueColorClass,
            defaultVisible: originalCardConfig.defaultVisible,
            // User-specific property
            visible: userSetting.visible,
          });
        }
      });

      // 2. Add any new cards from ALL_SUMMARY_CARDS_CONFIG that weren't in currentconfiguracoes
      //    These will be added at the end. If order of new items matters, this logic might need adjustment.
      ALL_SUMMARY_CARDS_CONFIG.forEach(originalCardConfig => {
        if (!newLocalconfiguracoes.find(s => s.id === originalCardConfig.id)) {
          newLocalconfiguracoes.push({
            ...originalCardConfig, // All static props from original
            visible: originalCardConfig.defaultVisible, // Default visibility for new items
          });
        }
      });
      setLocalconfiguracoes(newLocalconfiguracoes);
    }
  }, [currentconfiguracoes, isOpen]);

  const handleCheckboxChange = (cardId: string, checked: boolean) => {
    setLocalconfiguracoes(prevconfiguracoes =>
      prevconfiguracoes.map(card =>
        card.id === cardId ? { ...card, visible: checked } : card
      )
    );
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setLocalconfiguracoes(prevconfiguracoes => {
      const newconfiguracoes = [...prevconfiguracoes];
      const itemToMove = newconfiguracoes[index];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= newconfiguracoes.length) {
        return prevconfiguracoes;
      }

      newconfiguracoes[index] = newconfiguracoes[swapIndex];
      newconfiguracoes[swapIndex] = itemToMove;
      return newconfiguracoes;
    });
  };

  const handleSaveChanges = () => {
    onSave(localconfiguracoes);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Resumo</DialogTitle>
          <DialogDescription>
            Selecione os cards que você deseja exibir e ordene-os no painel de resumo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="space-y-2 py-3">
            {localconfiguracoes.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                <div className="flex items-center space-x-3 flex-grow">
                  <Checkbox
                    id={`summary-card-${card.id}`}
                    checked={card.visible}
                    onCheckedChange={(checked) => handleCheckboxChange(card.id, !!checked)}
                  />
                  <Label htmlFor={`summary-card-${card.id}`} className="text-sm font-normal cursor-pointer flex-1">
                    {card.title}
                  </Label>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                    aria-label={`Mover ${card.title} para cima`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={index === localconfiguracoes.length - 1}
                    aria-label={`Mover ${card.title} para baixo`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {localconfiguracoes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Não há cards para configurar.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveChanges}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
