
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

// Renaming local type to avoid conflict if SummaryCardConfig is also imported for other reasons.
interface DialogSummaryCardConfig extends SummaryCardConfig {
  visible: boolean;
}

interface SummarySettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentSettings: DialogSummaryCardConfig[];
  onSave: (updatedSettings: DialogSummaryCardConfig[]) => void;
}

export function SummarySettingsDialog({
  isOpen,
  onOpenChange,
  currentSettings,
  onSave,
}: SummarySettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<DialogSummaryCardConfig[]>([]);

  useEffect(() => {
    // Deep copy to avoid mutating the prop directly and to reset on open/prop change
    if (isOpen) {
      setLocalSettings(JSON.parse(JSON.stringify(currentSettings)));
    }
  }, [currentSettings, isOpen]);

  const handleCheckboxChange = (cardId: string, checked: boolean) => {
    setLocalSettings(prevSettings =>
      prevSettings.map(card =>
        card.id === cardId ? { ...card, visible: checked } : card
      )
    );
  };

  const handleSaveChanges = () => {
    onSave(localSettings);
    onOpenChange(false); // Close dialog on save
  };

  const handleCancel = () => {
    onOpenChange(false);
    // No need to reset localSettings here as useEffect will handle it if reopened with original currentSettings
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Resumo</DialogTitle>
          <DialogDescription>
            Selecione os cards que você deseja exibir no painel de resumo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="space-y-3 py-3">
            {localSettings.map(card => (
              <div key={card.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`summary-card-${card.id}`}
                  checked={card.visible}
                  onCheckedChange={(checked) => handleCheckboxChange(card.id, !!checked)}
                />
                <Label htmlFor={`summary-card-${card.id}`} className="text-sm font-normal cursor-pointer flex-1">
                  {card.title}
                </Label>
              </div>
            ))}
            {localSettings.length === 0 && (
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
