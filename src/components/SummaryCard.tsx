
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
  icon: IconInput, // Renamed prop alias to avoid confusion if IconInput itself is an object
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
  
  // Resolve the actual component.
  // If IconInput is already a function (the expected component), use it.
  // If IconInput is an object (e.g., a module with a default export), try to use its .default property.
  const IconComponent = typeof IconInput === 'function' 
    ? IconInput 
    : (IconInput as any)?.default;

  // Guard against an invalid IconComponent
  if (typeof IconComponent !== 'function') {
    console.error('Invalid icon provided to SummaryCard. Prop was:', IconInput, 'Resolved to:', IconComponent);
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
