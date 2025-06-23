
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
import type { ShortcutCardConfig } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ALL_SHORTCUT_CARDS_CONFIG } from '@/lib/constants';

interface DialogShortcutCardConfig extends ShortcutCardConfig {
  visible: boolean;
}

interface ShortcutconfiguracoesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentconfiguracoes: DialogShortcutCardConfig[];
  onSave: (updatedconfiguracoes: DialogShortcutCardConfig[]) => void;
}

export function ShortcutconfiguracoesDialog({
  isOpen,
  onOpenChange,
  currentconfiguracoes,
  onSave,
}: ShortcutconfiguracoesDialogProps) {
  const [localconfiguracoes, setLocalconfiguracoes] = useState<DialogShortcutCardConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      let newLocalconfiguracoes: DialogShortcutCardConfig[] = [];

      // 1. Process currentconfiguracoes, keeping their order and visibility,
      //    refreshing static data, and filtering out stale items.
      currentconfiguracoes.forEach(userSetting => {
        const originalCardConfig = ALL_SHORTCUT_CARDS_CONFIG.find(c => c.id === userSetting.id);
        if (originalCardConfig) { // Only include if it's still a valid card
          newLocalconfiguracoes.push({
            // Static properties from original config
            id: originalCardConfig.id,
            label: originalCardConfig.label,
            icon: originalCardConfig.icon, // Crucial: always take icon from original
            iconBgColor: originalCardConfig.iconBgColor,
            defaultVisible: originalCardConfig.defaultVisible,
            // User-specific property
            visible: userSetting.visible,
          });
        }
      });

      // 2. Add any new cards from ALL_SHORTCUT_CARDS_CONFIG that weren't in currentconfiguracoes
      ALL_SHORTCUT_CARDS_CONFIG.forEach(originalCardConfig => {
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
          <DialogTitle>Personalizar Atalhos</DialogTitle>
          <DialogDescription>
            Selecione os atalhos que você deseja exibir e ordene-os na seção de atalhos.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="space-y-2 py-3">
            {localconfiguracoes.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                <div className="flex items-center space-x-3 flex-grow">
                  <Checkbox
                    id={`shortcut-card-${card.id}`}
                    checked={card.visible}
                    onCheckedChange={(checked) => handleCheckboxChange(card.id, !!checked)}
                  />
                  <Label htmlFor={`shortcut-card-${card.id}`} className="text-sm font-normal cursor-pointer flex-1">
                    {card.label}
                  </Label>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                    aria-label={`Mover ${card.label} para cima`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={index === localconfiguracoes.length - 1}
                    aria-label={`Mover ${card.label} para baixo`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {localconfiguracoes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Não há atalhos para configurar.</p>
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
