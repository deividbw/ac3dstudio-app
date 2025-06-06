import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ShortcutCardProps {
  icon: LucideIcon;
  label: string;
  iconBgColor: string;
  iconColor?: string;
  onClick?: () => void;
}

export function ShortcutCard({ icon: Icon, label, iconBgColor, iconColor = "text-white", onClick }: ShortcutCardProps) {
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer w-36 flex-shrink-0"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center space-y-2 p-3 text-center">
        <div className={cn("p-2.5 rounded-lg shadow", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <p className="text-xs font-medium text-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
