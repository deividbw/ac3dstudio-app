import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  iconBgColor: string; // e.g., 'bg-purple-500', 'bg-teal-500'
  iconColor?: string; // e.g., 'text-white'
  onClick?: () => void;
}

export function FeatureCard({ icon: Icon, title, iconBgColor, iconColor = "text-white", onClick }: FeatureCardProps) {
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-start space-y-3 p-4">
        <div className={cn("p-3 rounded-lg shadow", iconBgColor)}>
          <Icon className={cn("h-7 w-7", iconColor)} />
        </div>
        <h3 className="text-md font-semibold text-foreground">{title}</h3>
      </CardContent>
    </Card>
  );
}
