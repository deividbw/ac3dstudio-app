import { Cuboid } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2"> {/* Removed px-2 py-4 */}
      <Cuboid className="h-8 w-8 text-primary" />
      <h1 className="text-xl font-semibold text-sidebar-foreground font-headline">{APP_NAME}</h1>
    </div>
  );
}
