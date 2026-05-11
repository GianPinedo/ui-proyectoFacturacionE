import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  BookMarked,
  Boxes,
  Building2,
  ChartColumn,
  FileClock,
  FilePenLine,
  FileText,
  Hash,
  House,
  Mail,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Users,
  UsersRound,
} from 'lucide-angular';
import { NavigationItem } from '../../core/models/navigation-item.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Input() isMobileOpen = false;
  @Output() readonly closeRequested = new EventEmitter<void>();

  readonly menuItems: NavigationItem[] = [
    { label: 'Inicio', path: '/inicio', icon: House },
    { label: 'Empresa', path: '/empresa', icon: Building2 },
    { label: 'Usuarios y roles', path: '/usuarios-roles', icon: UsersRound },
    { label: 'Clientes', path: '/clientes', icon: Users },
    { label: 'Productos y servicios', path: '/productos-servicios', icon: Boxes },
    { label: 'Catálogos SUNAT', path: '/catalogos-sunat', icon: BookMarked },
    { label: 'Series y correlativos', path: '/series-correlativos', icon: Hash },
    { label: 'Ventas', path: '/ventas', icon: ShoppingCart },
    { label: 'Comprobantes', path: '/comprobantes', icon: FileText },
    { label: 'Notas crédito/débito', path: '/notas', icon: FilePenLine },
    { label: 'SUNAT/OSE', path: '/sunat-ose', icon: ShieldCheck },
    { label: 'Correo', path: '/correo', icon: Mail },
    { label: 'Reportes ventas', path: '/reportes-ventas', icon: ChartColumn },
    { label: 'Reportes tributarios', path: '/reportes-tributarios', icon: ReceiptText },
    { label: 'Auditoría', path: '/auditoria', icon: FileClock },
  ];

  closeOnMobile(): void {
    this.closeRequested.emit();
  }
}
