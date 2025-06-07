
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

interface DialogShortcutCardConfig extends ShortcutCardConfig {
  visible: boolean;
}

interface ShortcutSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentSettings: DialogShortcutCardConfig[];
  onSave: (updatedSettings: DialogShortcutCardConfig[]) => void;
}

export function ShortcutSettingsDialog({
  isOpen,
  onOpenChange,
  currentSettings,
  onSave,
}: ShortcutSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<DialogShortcutCardConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Create a new array of new objects to avoid direct state mutation
      setLocalSettings(currentSettings.map(card => ({ ...card })));
    }
  }, [currentSettings, isOpen]);

  const handleCheckboxChange = (cardId: string, checked: boolean) => {
    setLocalSettings(prevSettings =>
      prevSettings.map(card =>
        card.id === cardId ? { ...card, visible: checked } : card
      )
    );
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setLocalSettings(prevSettings => {
      const newSettings = [...prevSettings];
      const itemToMove = newSettings[index];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= newSettings.length) {
        return prevSettings;
      }

      newSettings[index] = newSettings[swapIndex];
      newSettings[swapIndex] = itemToMove;
      return newSettings;
    });
  };

  const handleSaveChanges = () => {
    onSave(localSettings);
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
            {localSettings.map((card, index) => (
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
                    disabled={index === localSettings.length - 1}
                    aria-label={`Mover ${card.label} para baixo`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {localSettings.length === 0 && (
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
