import { LucideIconData } from 'lucide-angular';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIconData;
  code?: string;
  description?: string;
  order?: number;
}
