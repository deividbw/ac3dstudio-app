import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor?: string;
  title: string;
  description: string;
  value: string | number;
  onClick?: () => void;
}

export function SummaryCard({ icon: Icon, iconBgColor, iconColor = "text-white", title, description, value, onClick }: SummaryCardProps) {
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex items-center space-x-4 p-4">
        <div className={cn("p-3 rounded-lg shadow", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm font-semibold text-primary">{value}</span>
          <Icons.ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
