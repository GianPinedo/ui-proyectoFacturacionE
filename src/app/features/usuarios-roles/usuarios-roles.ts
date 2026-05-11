import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosListMeta } from '../../core/models/usuario.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-usuarios-roles',
  imports: [ReactiveFormsModule, LucideAngularModule, PageTitleComponent, UiButtonComponent, UiCardComponent, UiTableComponent, UiPaginationComponent],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css',
})
export class UsuariosRolesComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Usuarios y roles';
  readonly subtitle = 'Gestiona usuarios, roles y accesos del sistema.';

  readonly roles = ['ADMINISTRADOR', 'VENDEDOR', 'FACTURADOR', 'SOPORTE'];
  readonly pageSizeOptions = [5, 10, 20];
  readonly defaultPageSize = 10;
  readonly searchIcon = Search;

  readonly filtersForm = this.fb.nonNullable.group({
    buscar: [''],
    rol: [''],
    pageSize: [this.defaultPageSize],
  });

  readonly columns: TableColumn[] = [
    { key: 'nombreCompleto', label: 'Nombre completo' },
    { key: 'username', label: 'Usuario' },
    { key: 'correo', label: 'Correo' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Creado' },
  ];

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadUsuarios(0);
  }

  onSearch(): void {
    this.loadUsuarios(0);
  }

  clearFilters(): void {
    this.filtersForm.reset({ buscar: '', rol: '', pageSize: this.defaultPageSize });
    this.loadUsuarios(0);
  }

  onPageSizeChange(size: number): void {
    this.filtersForm.controls.pageSize.setValue(size);

    if (!Number.isFinite(size) || size <= 0) {
      return;
    }

    this.pagination.update((current) => ({
      ...current,
      limit: size,
      page: 0,
    }));

    this.loadUsuarios(0);
  }

  goToPage(pageNumber: number): void {
    const targetIndex = pageNumber;
    const totalPages = this.pagination().totalPages;

    if (this.isLoading() || targetIndex < 0 || targetIndex >= totalPages || targetIndex === this.pagination().page) {
      return;
    }

    this.loadUsuarios(targetIndex);
  }

  get skeletonRows(): number {
    const size = Number(this.filtersForm.controls.pageSize.value);
    return Number.isFinite(size) && size > 0 ? size : this.defaultPageSize;
  }

  private loadUsuarios(page: number): void {
    this.isLoading.set(true);

    const { buscar, rol, pageSize } = this.filtersForm.getRawValue();
    const currentLimit = Number(pageSize) || this.defaultPageSize;

    this.usuariosService
      .getUsuarios({
        page,
        size: currentLimit,
        buscar,
        rol,
      })
      .subscribe({
        next: (response) => {
          this.pagination.set(
            response.meta
              ? { ...response.meta, limit: currentLimit }
              : {
                  page,
                  limit: currentLimit,
                  total: response.data?.length ?? 0,
                  totalPages: 1,
                },
          );

          this.rows.set(response.data.map((item) => ({
            nombreCompleto: `${item.nombres} ${item.apellidos}`.trim(),
            username: item.username,
            correo: item.correo,
            rol: this.formatRole(item.rol),
            estado: this.formatStatus(item.estado),
            createdAt: this.formatDate(item.createdAt),
          })));

          this.isLoading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.isLoading.set(false);
        },
      });
  }

  private formatStatus(value: string): string {
    return value.toLowerCase() === 'activo' ? 'Activo' : value;
  }

  private formatRole(value: string): string {
    return value
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('es-PE');
  }
}
