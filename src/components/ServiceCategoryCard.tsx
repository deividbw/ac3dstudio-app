
"use client";

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCategoryCardProps {
  icon: LucideIcon;
  title: string;
  bgColor: string;
  href: string;
  className?: string;
}

export function ServiceCategoryCard({ icon: Icon, title, bgColor, href, className }: ServiceCategoryCardProps) {
  return (
    <Link href={href} legacyBehavior>
      <a 
        className={cn(
          "flex flex-col items-center justify-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white min-h-[150px] text-center",
          bgColor,
          className
        )}
      >
        <Icon className="h-12 w-12 mb-3" />
        <span className="text-xl font-semibold">{title}</span>
      </a>
    </Link>
  );
}
