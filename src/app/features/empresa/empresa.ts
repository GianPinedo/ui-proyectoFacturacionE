import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import { EmpresaListItem } from '../../core/models/empresa.model';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosListMeta } from '../../core/models/usuario.model';
import { EmpresasService } from '../../core/services/empresas.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';
import {
  CreateEmpresaModalComponent,
  EmpresaFormModalInitialData,
  EmpresaFormModalMode,
  EmpresaFormModalPayload,
} from './components/create-empresa-modal/create-empresa-modal';

@Component({
  selector: 'app-empresa',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PageTitleComponent,
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
    UiPaginationComponent,
    CreateEmpresaModalComponent,
  ],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit {
  private readonly empresasService = inject(EmpresasService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Empresa';
  readonly subtitle = 'Configura los datos tributarios y la emisión electrónica.';
  readonly pageSizeOptions = [5, 10, 20];
  readonly defaultPageSize = 10;
  readonly searchIcon = Search;

  readonly filtersForm = this.fb.nonNullable.group({
    ruc: [''],
    razonSocial: [''],
    estado: [''],
    pageSize: [this.defaultPageSize],
  });

  readonly columns: TableColumn[] = [
    { key: 'ruc', label: 'RUC' },
    { key: 'razonSocial', label: 'Razón social' },
    { key: 'nombreComercial', label: 'Nombre comercial' },
    { key: 'correo', label: 'Correo' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Creado' },
    { key: 'acciones', label: 'Acciones' },
  ];

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingInitialData = signal(false);
  readonly isModalOpen = signal(false);
  readonly modalMode = signal<EmpresaFormModalMode>('create');
  readonly editingEmpresaId = signal<string | null>(null);
  readonly modalInitialData = signal<EmpresaFormModalInitialData | null>(null);

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadEmpresas(0);
  }

  onSearch(): void {
    this.loadEmpresas(0);
  }

  clearFilters(): void {
    this.filtersForm.reset({
      ruc: '',
      razonSocial: '',
      estado: '',
      pageSize: this.defaultPageSize,
    });
    this.loadEmpresas(0);
  }

  openCreateEmpresaForm(): void {
    this.modalMode.set('create');
    this.editingEmpresaId.set(null);
    this.modalInitialData.set(null);
    this.isModalOpen.set(true);
  }

  closeEmpresaForm(): void {
    this.isModalOpen.set(false);
    this.editingEmpresaId.set(null);
    this.modalInitialData.set(null);
    this.isLoadingInitialData.set(false);
  }

  submitEmpresa(payload: EmpresaFormModalPayload): void {
    if (this.modalMode() === 'edit') {
      this.submitEditEmpresa(payload);
      return;
    }

    this.isSaving.set(true);

    this.empresasService.createEmpresa(payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Empresa creada',
          text: response.message || 'La empresa fue registrada correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeEmpresaForm();
        this.loadEmpresas(0);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.showError('Error al crear empresa', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
      },
    });
  }

  onEditRequested(row: Record<string, string>): void {
    const idEmpresa = row['idEmpresa'];

    if (!idEmpresa) {
      return;
    }

    this.modalMode.set('edit');
    this.editingEmpresaId.set(idEmpresa);
    this.modalInitialData.set(null);
    this.isModalOpen.set(true);
    this.isLoadingInitialData.set(true);

    this.empresasService.getEmpresaById(idEmpresa).subscribe({
      next: (response) => {
        this.isLoadingInitialData.set(false);
        const empresa = response.data;

        this.modalInitialData.set({
          ruc: empresa.ruc,
          razonSocial: empresa.razonSocial,
          nombreComercial: empresa.nombreComercial ?? '',
          direccion: empresa.direccion,
          ubigeo: empresa.ubigeo ?? '',
          correo: empresa.correo ?? '',
          telefono: empresa.telefono ?? '',
        });
      },
      error: (error: unknown) => {
        this.closeEmpresaForm();
        this.showError('Error al cargar empresa', this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR);
      },
    });
  }

  onDeleteRequested(row: Record<string, string>): void {
    const idEmpresa = row['idEmpresa'];
    const razonSocial = row['razonSocial'] || 'empresa';
    const isInactive = (row['estado'] || '').toUpperCase() === 'INACTIVO';

    if (!idEmpresa) {
      return;
    }

    if (isInactive) {
      void Swal.fire({
        icon: 'info',
        title: 'Empresa inactiva',
        text: 'La empresa ya se encuentra inactiva.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Eliminar empresa',
      text: `Se desactivará la empresa ${razonSocial}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      preConfirm: () => {
        return new Promise<void>((resolve, reject) => {
          this.empresasService.updateEmpresaEstado(idEmpresa, { estado: 'INACTIVO' }).subscribe({
            next: () => resolve(),
            error: (error: unknown) => reject(new Error(this.extractErrorMessage(error) || AppMessages.GENERIC_STATUS_UPDATE_ERROR)),
          });
        }).catch((error: Error) => {
          Swal.showValidationMessage(error.message);
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      void Swal.fire({
        icon: 'success',
        title: 'Empresa eliminada',
        text: 'La empresa fue desactivada correctamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadEmpresas(this.pagination().page);
    });
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

    this.loadEmpresas(0);
  }

  goToPage(pageNumber: number): void {
    const totalPages = this.pagination().totalPages;

    if (this.isLoading() || pageNumber < 0 || pageNumber >= totalPages || pageNumber === this.pagination().page) {
      return;
    }

    this.loadEmpresas(pageNumber);
  }

  get skeletonRows(): number {
    const size = Number(this.filtersForm.controls.pageSize.value);
    return Number.isFinite(size) && size > 0 ? size : this.defaultPageSize;
  }

  private submitEditEmpresa(payload: EmpresaFormModalPayload): void {
    const editingId = this.editingEmpresaId();

    if (!editingId) {
      return;
    }

    this.isSaving.set(true);

    this.empresasService.updateEmpresa(editingId, payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Empresa actualizada',
          text: response.message || 'Los cambios se guardaron correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeEmpresaForm();
        this.loadEmpresas(this.pagination().page);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.showError('Error al actualizar', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
      },
    });
  }

  private loadEmpresas(page: number): void {
    this.isLoading.set(true);

    const { ruc, razonSocial, estado, pageSize } = this.filtersForm.getRawValue();
    const currentLimit = Number(pageSize) || this.defaultPageSize;

    this.empresasService
      .getEmpresas({
        page,
        size: currentLimit,
        ruc,
        razonSocial,
        estado: estado as 'ACTIVO' | 'INACTIVO' | '',
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

          this.rows.set((response.data ?? []).map((item) => this.toTableRow(item)));
          this.isLoading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.isLoading.set(false);
        },
      });
  }

  private toTableRow(item: EmpresaListItem): Record<string, string> {
    return {
      idEmpresa: String(item.idEmpresa),
      ruc: item.ruc,
      razonSocial: item.razonSocial,
      nombreComercial: item.nombreComercial || '-',
      correo: item.correo || '-',
      estado: this.formatStatus(item.estadoTexto || (item.estado ? 'ACTIVO' : 'INACTIVO')),
      createdAt: this.formatDate(item.createdAt),
    };
  }

  private formatStatus(value: string): string {
    return value.toLowerCase() === 'activo' ? 'Activo' : value;
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

  private showError(title: string, text: string): void {
    void Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#00AD8F',
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const payload = (error as { error?: unknown; message?: unknown }).error ?? error;

      if (typeof payload === 'string') {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const message = (payload as { message?: unknown }).message;

        if (typeof message === 'string') {
          return message;
        }

        if (Array.isArray(message)) {
          return message.join(' ');
        }
      }

      const fallback = (error as { message?: unknown }).message;
      if (typeof fallback === 'string') {
        return fallback;
      }
    }

    return '';
  }
}

