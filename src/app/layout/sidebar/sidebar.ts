import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronDown, ChevronRight, Menu } from 'lucide-angular';
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
import { filter } from 'rxjs/operators';
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
  private readonly router = inject(Router);
  private hasEmittedReady = false;

  @Input() isMobileOpen = false;
  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly collapsedChanged = new EventEmitter<boolean>();
  @Output() readonly menuReady = new EventEmitter<void>();

  readonly isCollapsed = signal(false);
  readonly menuIcon = Menu;
  readonly chevronRightIcon = ChevronRight;
  readonly chevronDownIcon = ChevronDown;
  readonly menuItems = signal<NavigationItem[]>([]);
  readonly expandedGroups = signal<Record<string, boolean>>({});

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
    { id: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: UsersRound, order: 3 },
    { id: 'roles', label: 'Roles', path: '/roles', icon: ShieldCheck, order: 4 },
    { id: 'modulos', label: 'Módulos', path: '/modulos', icon: AppWindow, order: 5 },
    { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users, order: 6 },
    { id: 'productos-servicios', label: 'Productos y servicios', path: '/productos-servicios', icon: Boxes, order: 7 },
    { id: 'catalogos-sunat', label: 'Catalogos SUNAT', path: '/catalogos-sunat', icon: BookMarked, order: 8 },
    { id: 'comprobantes', label: 'Comprobantes', path: '/comprobantes', icon: ReceiptText, order: 9 },
    { id: 'auditoria', label: 'Auditoria', path: '/auditoria', icon: FileClock, order: 10 },
  ];

  ngOnInit(): void {
    this.loadMenuItemsByRole();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncExpandedGroupsWithCurrentRoute();
      });
  }

  toggleCollapse(): void {
    this.isCollapsed.update((value) => !value);
    this.collapsedChanged.emit(this.isCollapsed());
  }

  toggleGroup(itemId: string): void {
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
      this.collapsedChanged.emit(false);
    }

    this.expandedGroups.update((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  isGroupExpanded(itemId: string): boolean {
    const current = this.expandedGroups();
    return current[itemId] ?? false;
  }

  hasChildren(item: NavigationItem): boolean {
    return !!item.children?.length;
  }

  closeOnMobile(): void {
    this.closeRequested.emit();
  }

  private loadMenuItemsByRole(): void {
    this.usuariosService.getMisPermisosModulos().subscribe({
      next: (response) => {
        const modules = this.extractModulesFromResponse(response);
        const treeItems = this.buildNavigationItems(modules);
        const finalItems = treeItems.length > 0 ? treeItems : this.fallbackMenuItems;

        this.menuItems.set(finalItems);
        this.expandedGroups.set(this.buildInitialExpandedGroups(finalItems));
        this.notifyMenuReady();
      },
      error: () => {
        this.menuItems.set(this.fallbackMenuItems);
        this.expandedGroups.set(this.buildInitialExpandedGroups(this.fallbackMenuItems));
        this.notifyMenuReady();
      },
    });
  }

  private notifyMenuReady(): void {
    if (this.hasEmittedReady) {
      return;
    }

    this.hasEmittedReady = true;
    this.menuReady.emit();
  }

  private extractModulesFromResponse(response: unknown): ModuloPermisoRolItem[] {
    if (Array.isArray(response)) {
      return response as ModuloPermisoRolItem[];
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const payload = response as { data?: unknown };

    if (Array.isArray(payload.data)) {
      return payload.data as ModuloPermisoRolItem[];
    }

    if (payload.data && typeof payload.data === 'object') {
      const nested = payload.data as { data?: unknown };

      if (Array.isArray(nested.data)) {
        return nested.data as ModuloPermisoRolItem[];
      }
    }

    return [];
  }

  private buildNavigationItems(modules: ModuloPermisoRolItem[]): NavigationItem[] {
    const hasNestedChildren = modules.some((module) => (module.hijos?.length ?? 0) > 0);
    const hasFlatParentRefs = modules.some((module) => module.idModuloPadre !== null && module.idModuloPadre !== undefined);

    if (hasNestedChildren) {
      return this.toNavigationTree(modules);
    }

    if (hasFlatParentRefs) {
      return this.toNavigationTreeFromFlat(modules, null);
    }

    return this.toNavigationTree(modules);
  }

  private toNavigationTreeFromFlat(modules: ModuloPermisoRolItem[], parentId: string | number | null): NavigationItem[] {
    const childrenModules = this.sortModules(modules).filter(
      (module) => this.normalizeId(module.idModuloPadre) === this.normalizeId(parentId),
    );

    const result: NavigationItem[] = [];

    for (const module of childrenModules) {
      if (!this.isAllowedModule(module)) {
        continue;
      }

      const children = this.toNavigationTreeFromFlat(modules, module.idModulo);
      const item = this.toNavigationItem(module, children);

      if (children.length === 0 && !item.path.startsWith('/')) {
        continue;
      }

      result.push(item);
    }

    return result;
  }

  private normalizeId(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private toNavigationTree(modules: ModuloPermisoRolItem[]): NavigationItem[] {
    const sorted = this.sortModules(modules);
    const result: NavigationItem[] = [];

    for (const module of sorted) {
      if (!this.isAllowedModule(module)) {
        continue;
      }

      const children = this.toNavigationTree(module.hijos ?? []);
      const item = this.toNavigationItem(module, children);

      if (children.length === 0 && !item.path.startsWith('/')) {
        continue;
      }

      result.push(item);
    }

    return result;
  }

  private sortModules(modules: ModuloPermisoRolItem[]): ModuloPermisoRolItem[] {
    return [...modules].sort((left, right) => {
      const leftOrder = Number(left.orden) || 0;
      const rightOrder = Number(right.orden) || 0;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.nombre.localeCompare(right.nombre);
    });
  }

  private isAllowedModule(module: ModuloPermisoRolItem): boolean {
    const hasReadPermission = module.permisoLectura;
    const isActive = module.estado?.toUpperCase() === 'ACTIVO';

    return hasReadPermission && isActive;
  }

  private buildInitialExpandedGroups(items: NavigationItem[]): Record<string, boolean> {
    const state: Record<string, boolean> = {};
    const currentPath = this.normalizePath(this.router.url);

    const walk = (nodes: NavigationItem[]): boolean => {
      let containsActive = false;

      for (const node of nodes) {
        if (node.children?.length) {
          const childContainsActive = walk(node.children);
          state[node.id] = childContainsActive;
          containsActive = containsActive || childContainsActive;
        }

        if (this.normalizePath(node.path) === currentPath) {
          containsActive = true;
        }
      }

      return containsActive;
    };

    walk(items);
    return state;
  }

  private syncExpandedGroupsWithCurrentRoute(): void {
    const currentItems = this.menuItems();

    if (!currentItems.length) {
      return;
    }

    const merged = {
      ...this.expandedGroups(),
      ...this.buildInitialExpandedGroups(currentItems),
    };

    this.expandedGroups.set(merged);
  }

  private normalizePath(path: string | null | undefined): string {
    if (!path) {
      return '';
    }

    return path.split('?')[0].split('#')[0].replace(/\/+$/, '');
  }

  private toNavigationItem(module: ModuloPermisoRolItem, children: NavigationItem[] = []): NavigationItem {
    return {
      id: String(module.idModulo),
      label: module.nombre,
      path: this.resolveFrontendRoute(module),
      icon: this.resolveIcon(module.icono),
      children,
      code: module.codigo,
      description: module.descripcion,
      order: Number(module.orden) || 0,
    };
  }

  private resolveFrontendRoute(module: ModuloPermisoRolItem): string {
    const routeByCode: Record<string, string> = {
      DASHBOARD: '/inicio',
      EMPRESAS: '/empresa',
      USUARIOS: '/usuarios',
      ROLES: '/roles',
      MODULOS: '/modulos',
      CLIENTES: '/clientes',
      PRODUCTOS: '/productos-servicios',
      CATALOGOS: '/catalogos-sunat',
      SERIE: '/series-correlativos',
      SERIES: '/series-correlativos',
      FACTURAS: '/comprobantes',
      AUDITORIA: '/auditoria',
    };

    const routeByModulePath: Record<string, string> = {
      '/dashboard': '/inicio',
      '/maestros/empresas': '/empresa',
      '/admin/usuarios': '/usuarios',
      '/admin/roles': '/roles',
      '/admin/modulos': '/modulos',
      '/clientes': '/clientes',
      '/productos': '/productos-servicios',
      '/maestros/catalogos': '/catalogos-sunat',
      '/series': '/series-correlativos',
      '/series-correlativos': '/series-correlativos',
      '/facturas': '/comprobantes',
      '/admin/auditoria': '/auditoria',
    };

    const normalizedCode = String(module.codigo ?? '').toUpperCase();
    const normalizedRoute = this.normalizePath(module.ruta);

    return routeByCode[normalizedCode] ?? routeByModulePath[normalizedRoute] ?? '';
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
