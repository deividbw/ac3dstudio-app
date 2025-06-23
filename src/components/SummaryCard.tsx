"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon; // Agora esperamos um LucideIcon diretamente
  iconBgColor: string;
  iconColor?: string;
  title: string;
  mainValue: string;
  subDescription: string;
  mainValueColorClass?: string;
  onClick?: () => void;
  isValueVisible?: boolean;
}

export function SummaryCard({ 
  icon: IconComponent, // Renomeado para clareza
  iconBgColor, 
  iconColor = "text-white", 
  title, 
  mainValue,
  subDescription,
  mainValueColorClass = "text-primary",
  onClick,
  isValueVisible = true,
}: SummaryCardProps) {
  const displayValue = isValueVisible ? mainValue : "R$ •••,••";
  
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow"
      onClick={onClick} 
    >
      <CardContent className="flex items-start space-x-3 p-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shadow-sm", iconBgColor)}>
          <IconComponent className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs text-muted-foreground">{title}</p>
          <h3 className={cn("text-lg font-bold", mainValueColorClass)}>{displayValue}</h3>
          <p className="text-xs text-muted-foreground">{subDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
}
