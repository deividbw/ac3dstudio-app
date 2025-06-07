
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor?: string;
  title: string;
  mainValue: string;
  subDescription: string;
  mainValueColorClass?: string; // e.g., "text-green-600", "text-red-500"
  onClick?: () => void;
}

export function SummaryCard({ 
  icon: Icon, 
  iconBgColor, 
  iconColor = "text-white", 
  title, 
  mainValue,
  subDescription,
  mainValueColorClass = "text-primary",
  onClick 
}: SummaryCardProps) {
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow"
      onClick={onClick} // Removed cursor-pointer if onClick is not always present or handled differently now
    >
      <CardContent className="flex items-start space-x-3 p-3">
        <div className={cn("p-2.5 rounded-lg shadow-sm", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs text-muted-foreground">{title}</p>
          <h3 className={cn("text-lg font-bold", mainValueColorClass)}>{mainValue}</h3>
          <p className="text-xs text-muted-foreground">{subDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
}
