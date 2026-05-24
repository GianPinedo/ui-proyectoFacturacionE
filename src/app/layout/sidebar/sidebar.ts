import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu } from 'lucide-angular';
import {
  AppWindow,
  BookMarked,
  Boxes,
  Building2,
  FileClock,
  House,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-angular';
import { NavigationItem } from '../../core/models/navigation-item.model';
import { ModuloPermisoRolItem } from '../../core/models/usuario.model';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);

  @Input() isMobileOpen = false;
  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly collapsedChanged = new EventEmitter<boolean>();

  readonly isCollapsed = signal(false);
  readonly menuIcon = Menu;
  readonly menuItems = signal<NavigationItem[]>([]);

  // Menu anterior (estatico)
  // readonly menuItems: NavigationItem[] = [
  //   { id: 'inicio', label: 'Inicio', path: '/inicio', icon: House },
  //   { id: 'empresa', label: 'Empresa', path: '/empresa', icon: Building2 },
  //   { id: 'usuarios-roles', label: 'Usuarios y roles', path: '/usuarios-roles', icon: UsersRound },
  //   { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users },
  //   { id: 'productos-servicios', label: 'Productos y servicios', path: '/productos-servicios', icon: Boxes },
  //   { id: 'catalogos-sunat', label: 'Catalogos SUNAT', path: '/catalogos-sunat', icon: BookMarked },
  //   { id: 'series-correlativos', label: 'Series y correlativos', path: '/series-correlativos', icon: AppWindow },
  //   { id: 'ventas', label: 'Ventas', path: '/ventas', icon: ShoppingCart },
  //   { id: 'comprobantes', label: 'Comprobantes', path: '/comprobantes', icon: ReceiptText },
  //   { id: 'sunat-ose', label: 'SUNAT/OSE', path: '/sunat-ose', icon: ShieldCheck },
  //   { id: 'auditoria', label: 'Auditoria', path: '/auditoria', icon: FileClock },
  // ];

  private readonly fallbackMenuItems: NavigationItem[] = [
    { id: 'inicio', label: 'Inicio', path: '/inicio', icon: House, order: 1 },
    { id: 'empresa', label: 'Empresa', path: '/empresa', icon: Building2, order: 2 },
    { id: 'usuarios-roles', label: 'Usuarios y roles', path: '/usuarios-roles', icon: UsersRound, order: 3 },
    { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users, order: 4 },
    { id: 'productos-servicios', label: 'Productos y servicios', path: '/productos-servicios', icon: Boxes, order: 5 },
    { id: 'catalogos-sunat', label: 'Catalogos SUNAT', path: '/catalogos-sunat', icon: BookMarked, order: 6 },
    { id: 'comprobantes', label: 'Comprobantes', path: '/comprobantes', icon: ReceiptText, order: 7 },
    { id: 'auditoria', label: 'Auditoria', path: '/auditoria', icon: FileClock, order: 8 },
  ];

  ngOnInit(): void {
    this.loadMenuItemsByRole();
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
    this.collapsedChanged.emit(this.isCollapsed());
  }

  closeOnMobile(): void {
    this.closeRequested.emit();
  }

  private loadMenuItemsByRole(): void {
    this.usuariosService.getMisPermisosModulos().subscribe({
      next: (response) => {
        const items = (response.data || [])
          .filter((module) => module.permisoLectura && module.estado?.toUpperCase() === 'ACTIVO')
          .sort((left, right) => {
            const leftOrder = Number(left.orden) || 0;
            const rightOrder = Number(right.orden) || 0;

            if (leftOrder !== rightOrder) {
              return leftOrder - rightOrder;
            }

            return left.nombre.localeCompare(right.nombre);
          })
          .map((module) => this.toNavigationItem(module));

        this.menuItems.set(items.length > 0 ? items : this.fallbackMenuItems);
      },
      error: () => {
        this.menuItems.set(this.fallbackMenuItems);
      },
    });
  }

  private toNavigationItem(module: ModuloPermisoRolItem): NavigationItem {
    return {
      id: module.idModulo,
      label: module.nombre,
      path: this.resolveFrontendRoute(module),
      icon: this.resolveIcon(module.icono),
      code: module.codigo,
      description: module.descripcion,
      order: Number(module.orden) || 0,
    };
  }

  private resolveFrontendRoute(module: ModuloPermisoRolItem): string {
    const routeByCode: Record<string, string> = {
      DASHBOARD: '/inicio',
      EMPRESAS: '/empresa',
      USUARIOS: '/usuarios-roles',
      ROLES: '/usuarios-roles',
      MODULOS: '/usuarios-roles',
      CLIENTES: '/clientes',
      PRODUCTOS: '/productos-servicios',
      CATALOGOS: '/catalogos-sunat',
      FACTURAS: '/comprobantes',
      AUDITORIA: '/auditoria',
    };

    const routeByModulePath: Record<string, string> = {
      '/dashboard': '/inicio',
      '/maestros/empresas': '/empresa',
      '/admin/usuarios': '/usuarios-roles',
      '/admin/roles': '/usuarios-roles',
      '/admin/modulos': '/usuarios-roles',
      '/clientes': '/clientes',
      '/productos': '/productos-servicios',
      '/maestros/catalogos': '/catalogos-sunat',
      '/facturas': '/comprobantes',
      '/admin/auditoria': '/auditoria',
    };

    return routeByCode[module.codigo] ?? routeByModulePath[module.ruta] ?? module.ruta;
  }

  private resolveIcon(iconName: string): typeof House {
    const iconByName: Record<string, typeof House> = {
      dashboard: House,
      person_add: UserPlus,
      business: Building2,
      catalog: BookMarked,
      settings: Settings,
      security: ShieldCheck,
      inventory: Boxes,
      apps: AppWindow,
      people: Users,
      history: FileClock,
      shopping_cart: ShoppingCart,
      receipt: ReceiptText,
    };

    return iconByName[iconName] ?? AppWindow;
  }
}
