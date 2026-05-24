import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import { ModuloListItem, UsuariosListMeta } from '../../core/models/usuario.model';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-modulos',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PageTitleComponent,
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
    UiPaginationComponent,
  ],
  templateUrl: './modulos.html',
  styleUrl: './modulos.css',
})
export class ModulosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Módulos';
  readonly subtitle = 'Administra el catálogo de módulos del sistema.';
  readonly searchIcon = Search;
  readonly pageSizeOptions = [5, 10, 20];
  readonly defaultPageSize = 10;
  readonly skeletonRows = 8;
  readonly parentOptionsLimit = 100;

  readonly columns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'codigo', label: 'Código' },
    { key: 'ruta', label: 'Ruta' },
    { key: 'padre', label: 'Módulo padre' },
    { key: 'orden', label: 'Orden' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Creado' },
    { key: 'acciones', label: 'Acciones' },
  ];

  readonly filtersForm = this.fb.nonNullable.group({
    estado: [''],
    pageSize: [this.defaultPageSize],
  });

  readonly rows = signal<Record<string, string>[]>([]);
  readonly parentOptions = signal<Array<{ value: string; label: string }>>([]);
  readonly isLoading = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly isSavingCreate = signal(false);
  readonly isLoadingInitialData = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly editingModuloId = signal<string | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    codigo: ['', [Validators.required]],
    icono: ['', [Validators.required]],
    ruta: ['', [Validators.required]],
    idModuloPadre: [''],
    orden: [1, [Validators.required, Validators.min(1)]],
  });

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadModulos(0);
  }

  onSearch(): void {
    this.loadModulos(0);
  }

  openCreateForm(): void {
    this.loadParentOptionsForModal();
    this.modalMode.set('create');
    this.editingModuloId.set(null);
    this.createForm.reset({
      nombre: '',
      descripcion: '',
      codigo: '',
      icono: '',
      ruta: '',
      idModuloPadre: '',
      orden: 1,
    });
    this.isCreateModalOpen.set(true);
  }

  closeCreateForm(): void {
    this.isCreateModalOpen.set(false);
    this.isLoadingInitialData.set(false);
    this.editingModuloId.set(null);
    this.modalMode.set('create');
  }

  submitCreateForm(): void {
    if (this.createForm.invalid || this.isSavingCreate()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();

    const createPayload = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || undefined,
      codigo: raw.codigo.trim().toUpperCase(),
      icono: raw.icono.trim(),
      ruta: raw.ruta.trim(),
      idModuloPadre: raw.idModuloPadre ? Number(raw.idModuloPadre) : undefined,
      orden: Number(raw.orden),
    };

    const updatePayload = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || undefined,
      icono: raw.icono.trim(),
      ruta: raw.ruta.trim(),
      orden: Number(raw.orden),
    };

    this.isSavingCreate.set(true);

    const editingId = this.editingModuloId();
    const request$ = this.modalMode() === 'edit' && editingId
      ? this.usuariosService.updateModulo(editingId, updatePayload)
      : this.usuariosService.createModulo(createPayload);

    request$.subscribe({
      next: (response) => {
        this.isSavingCreate.set(false);
        this.closeCreateForm();

        void Swal.fire({
          icon: 'success',
          title: this.modalMode() === 'edit' ? 'Módulo actualizado' : 'Módulo creado',
          text:
            response.message ||
            (this.modalMode() === 'edit'
              ? 'El módulo se actualizó correctamente.'
              : 'El módulo se registró correctamente.'),
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.loadModulos(0);
      },
      error: (error: unknown) => {
        this.isSavingCreate.set(false);

        void Swal.fire({
          icon: 'error',
          title: this.modalMode() === 'edit' ? 'Error al actualizar módulo' : 'Error al crear módulo',
          text: this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  onEditRequested(row: Record<string, string>): void {
    const idModulo = row['idModulo'];

    if (!idModulo) {
      return;
    }

    this.loadParentOptionsForModal();
    this.modalMode.set('edit');
    this.editingModuloId.set(idModulo);
    this.isCreateModalOpen.set(true);
    this.isLoadingInitialData.set(true);

    this.usuariosService.getModuloById(idModulo).subscribe({
      next: (response) => {
        this.isLoadingInitialData.set(false);
        const modulo = response.data;

        this.createForm.reset({
          nombre: modulo.nombre ?? '',
          descripcion: modulo.descripcion ?? '',
          codigo: modulo.codigo ?? '',
          icono: modulo.icono ?? '',
          ruta: modulo.ruta ?? '',
          idModuloPadre: modulo.idModuloPadre ? String(modulo.idModuloPadre) : '',
          orden: Number(modulo.orden) || 1,
        });
      },
      error: (error: unknown) => {
        this.closeCreateForm();
        void Swal.fire({
          icon: 'error',
          title: 'Error al cargar módulo',
          text: this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  onDisableAccessRequested(row: Record<string, string>): void {
    const idModulo = row['idModulo'];
    const nombreModulo = row['nombre'] || 'módulo';

    if (!idModulo) {
      return;
    }

    const currentEstado = (row['estado'] || '').toUpperCase();
    const isActive = currentEstado === 'ACTIVO';
    const nextEstado = isActive ? 'INACTIVO' : 'ACTIVO';

    void Swal.fire({
      icon: 'warning',
      title: isActive ? 'Desactivar módulo' : 'Activar módulo',
      text: isActive
        ? `Se desactivará el módulo ${nombreModulo}.`
        : `Se activará el módulo ${nombreModulo}.`,
      input: 'textarea',
      inputLabel: 'Motivo',
      inputValue: isActive
        ? 'Módulo desactivado por mantenimiento.'
        : 'Módulo activado nuevamente.',
      inputPlaceholder: 'Ingresa el motivo del cambio de estado',
      inputValidator: (value) => {
        if (!value?.trim()) {
          return AppMessages.USER_STATE_REASON_REQUIRED;
        }

        return null;
      },
      showCancelButton: true,
      confirmButtonText: isActive ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      preConfirm: (motivo) => {
        return new Promise<void>((resolve, reject) => {
          this.usuariosService
            .updateModuloEstado(idModulo, {
              estado: nextEstado,
              motivo: String(motivo ?? '').trim(),
            })
            .subscribe({
              next: () => resolve(),
              error: (error: unknown) => reject(new Error(this.extractErrorMessage(error) || AppMessages.GENERIC_STATUS_UPDATE_ERROR)),
            });
        }).catch((error: Error) => {
          Swal.showValidationMessage(error.message);
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
      didOpen: () => {
        const input = Swal.getInput() as HTMLTextAreaElement | null;
        input?.setAttribute('rows', '3');
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      void Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: isActive ? 'El módulo fue desactivado correctamente.' : 'El módulo fue activado correctamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadModulos(this.pagination().page);
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      estado: '',
      pageSize: this.defaultPageSize,
    });

    this.loadModulos(0);
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

    this.loadModulos(0);
  }

  goToPage(pageNumber: number): void {
    const targetIndex = pageNumber;
    const totalPages = this.pagination().totalPages;

    if (targetIndex < 0 || (totalPages > 0 && targetIndex >= totalPages)) {
      return;
    }

    this.loadModulos(targetIndex);
  }

  private loadModulos(page: number): void {
    const { estado, pageSize } = this.filtersForm.getRawValue();

    this.isLoading.set(true);

    this.usuariosService
      .getModulos({
        page,
        size: pageSize,
        estado: estado || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          const source = this.flattenAndDedupe(response.data || []);
          const idToName = new Map(source.map((item) => [String(item.idModulo), item.nombre]));
          this.parentOptions.set(
            source.map((item) => ({
              value: String(item.idModulo),
              label: `${item.nombre} (${item.codigo})`,
            })),
          );

          this.rows.set(source.map((item) => this.toRow(item, idToName)));

          const meta = response.meta;
          this.pagination.set({
            page,
            limit: meta?.limit ?? pageSize,
            total: meta?.total ?? source.length,
            totalPages: meta?.totalPages ?? 1,
          });
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          this.rows.set([]);
          this.parentOptions.set([]);
          this.pagination.set({
            page,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          });

          void Swal.fire({
            icon: 'error',
            title: 'Error al cargar módulos',
            text: this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#00AD8F',
          });
        },
      });
  }

  private loadParentOptionsForModal(): void {
    this.usuariosService
      .getModulos({
        page: 0,
        size: this.parentOptionsLimit,
      })
      .subscribe({
        next: (response) => {
          const source = this.flattenAndDedupe(response.data || []);
          this.parentOptions.set(
            source.map((item) => ({
              value: String(item.idModulo),
              label: `${item.nombre} (${item.codigo})`,
            })),
          );
        },
        error: () => {
          // Keep previous options if refresh fails.
        },
      });
  }

  private flattenAndDedupe(items: ModuloListItem[]): ModuloListItem[] {
    const map = new Map<string, ModuloListItem>();

    const traverse = (nodes: ModuloListItem[]): void => {
      for (const node of nodes) {
        const id = String(node.idModulo);

        if (!map.has(id)) {
          map.set(id, node);
        }

        if (node.hijos?.length) {
          traverse(node.hijos);
        }
      }
    };

    traverse(items);

    return [...map.values()].sort((left, right) => {
      const leftOrder = Number(left.orden) || 0;
      const rightOrder = Number(right.orden) || 0;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.nombre.localeCompare(right.nombre);
    });
  }

  private toRow(item: ModuloListItem, idToName: Map<string, string>): Record<string, string> {
    const parentId = item.idModuloPadre ? String(item.idModuloPadre) : '';
    const parentLabel = parentId ? (idToName.get(parentId) ?? `ID ${parentId}`) : '-';

    return {
      idModulo: String(item.idModulo),
      nombre: item.nombre || '-',
      codigo: item.codigo || '-',
      ruta: item.ruta || '-',
      padre: parentLabel,
      orden: String(item.orden ?? '-'),
      estado: item.estado || '-',
      createdAt: this.formatDate(item.createdAt),
    };
  }

  private formatDate(rawDate: string | undefined): string {
    if (!rawDate) {
      return '-';
    }

    const parsed = new Date(rawDate);

    if (Number.isNaN(parsed.getTime())) {
      return rawDate;
    }

    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    const payload = (error as { error?: unknown; message?: unknown })?.error ?? error;

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(' ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    const fallbackMessage = (error as { message?: unknown })?.message;

    return typeof fallbackMessage === 'string' ? fallbackMessage : '';
  }
}
