
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react'; // Import LucideIcon for better type hinting if needed

interface SummaryCardProps {
  icon: React.ElementType; // ElementType is appropriate, allows functions or classes
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
  icon: IconInput, 
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
  
  let IconComponent: React.ElementType | undefined = undefined;

  if (typeof IconInput === 'function') {
    IconComponent = IconInput;
  } else if (IconInput && typeof IconInput === 'object' && typeof (IconInput as any).default === 'function') {
    IconComponent = (IconInput as any).default;
  }

  if (typeof IconComponent !== 'function') {
    // Check if it's the specific empty object case.
    const isEmptyObject = IconInput && typeof IconInput === 'object' && Object.keys(IconInput).length === 0 && IconInput.constructor === Object;

    if (!isEmptyObject) {
      // Log an error for other invalid icon types (e.g., string, number, non-empty object without a default export)
      // but not for the IconInput === {} case, as we handle it with a fallback.
      console.error(
        'Invalid icon provided to SummaryCard. Prop value was:', 
        IconInput, 
        'Resolved IconComponent to:', 
        IconComponent
      );
    }
    
    // Render a fallback or null to prevent crashing
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow" onClick={onClick}>
        <CardContent className="flex items-start space-x-3 p-3">
          <div className={cn("p-2.5 rounded-lg shadow-sm", iconBgColor, "flex items-center justify-center w-[34px] h-[34px]")}>
            {/* Basic placeholder for invalid icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line><circle cx="12" cy="12" r="10"></circle></svg>
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
  
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow"
      onClick={onClick} 
    >
      <CardContent className="flex items-start space-x-3 p-3">
        <div className={cn("p-2.5 rounded-lg shadow-sm", iconBgColor)}>
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
