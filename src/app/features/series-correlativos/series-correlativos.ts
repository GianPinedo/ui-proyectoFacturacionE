import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import { SerieComprobanteListItem } from '../../core/models/serie-comprobante.model';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosListMeta } from '../../core/models/usuario.model';
import { SeriesComprobantesService } from '../../core/services/series-comprobantes.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';
import {
  CreateSerieModalComponent,
  SerieFormModalInitialData,
  SerieFormModalMode,
  SerieFormModalPayload,
} from './components/create-serie-modal/create-serie-modal';

@Component({
  selector: 'app-series-correlativos',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PageTitleComponent,
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
    UiPaginationComponent,
    CreateSerieModalComponent,
  ],
  templateUrl: './series-correlativos.html',
  styleUrl: './series-correlativos.css',
})
export class SeriesCorrelativosComponent implements OnInit {
  private readonly seriesService = inject(SeriesComprobantesService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Series y correlativos';
  readonly subtitle = 'Controla la numeración de comprobantes electrónicos.';
  readonly pageSizeOptions = [5, 10, 20];
  readonly defaultPageSize = 10;
  readonly searchIcon = Search;

  readonly tipoComprobanteOptions = [
    { value: '01', label: '01 - Factura' },
    { value: '03', label: '03 - Boleta' },
    { value: '07', label: '07 - Nota de crédito' },
    { value: '08', label: '08 - Nota de débito' },
  ];

  readonly filtersForm = this.fb.nonNullable.group({
    tipoComprobante: [''],
    serie: [''],
    estado: [''],
    pageSize: [this.defaultPageSize],
  });

  readonly columns: TableColumn[] = [
    { key: 'serie', label: 'Serie' },
    { key: 'tipoComprobanteLabel', label: 'Tipo de comprobante' },
    { key: 'correlativoActual', label: 'Correlativo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Creado' },
    { key: 'acciones', label: 'Acciones' },
  ];

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingInitialData = signal(false);
  readonly isModalOpen = signal(false);
  readonly modalMode = signal<SerieFormModalMode>('create');
  readonly editingSerieId = signal<string | null>(null);
  readonly modalInitialData = signal<SerieFormModalInitialData | null>(null);

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadSeries(0);
  }

  onSearch(): void {
    this.loadSeries(0);
  }

  clearFilters(): void {
    this.filtersForm.reset({
      tipoComprobante: '',
      serie: '',
      estado: '',
      pageSize: this.defaultPageSize,
    });
    this.loadSeries(0);
  }

  openCreateSerieForm(): void {
    this.modalMode.set('create');
    this.editingSerieId.set(null);
    this.modalInitialData.set(null);
    this.isModalOpen.set(true);
  }

  closeSerieForm(): void {
    this.isModalOpen.set(false);
    this.editingSerieId.set(null);
    this.modalInitialData.set(null);
    this.isLoadingInitialData.set(false);
  }

  submitSerie(payload: SerieFormModalPayload): void {
    if (this.modalMode() === 'edit') {
      this.submitEditSerie(payload);
      return;
    }

    this.isSaving.set(true);

    this.seriesService.createSerie(payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Serie creada',
          text: response.message || 'La serie fue registrada correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeSerieForm();
        this.loadSeries(0);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.showError('Error al crear serie', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
      },
    });
  }

  onEditRequested(row: Record<string, string>): void {
    const idSerie = row['idSerie'];

    if (!idSerie) {
      return;
    }

    this.modalMode.set('edit');
    this.editingSerieId.set(idSerie);
    this.modalInitialData.set(null);
    this.isModalOpen.set(true);
    this.isLoadingInitialData.set(true);

    this.seriesService.getSerieById(idSerie).subscribe({
      next: (response) => {
        this.isLoadingInitialData.set(false);
        const serie = response.data;

        this.modalInitialData.set({
          tipoComprobante: serie.tipoComprobante,
          serie: serie.serie,
          correlativoActual: serie.correlativoActual,
          descripcion: serie.descripcion ?? '',
        });
      },
      error: (error: unknown) => {
        this.closeSerieForm();
        this.showError('Error al cargar serie', this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR);
      },
    });
  }

  onDisableAccessRequested(row: Record<string, string>): void {
    const idSerie = row['idSerie'];
    const serie = row['serie'] || 'serie';

    if (!idSerie) {
      return;
    }

    const currentEstado = (row['estado'] || '').toUpperCase();
    const isActive = currentEstado === 'ACTIVO';
    const nextEstado = isActive ? 'INACTIVO' : 'ACTIVO';

    void Swal.fire({
      icon: 'warning',
      title: isActive ? 'Desactivar serie' : 'Activar serie',
      text: isActive ? `Se desactivará la serie ${serie}.` : `Se activará la serie ${serie}.`,
      input: 'textarea',
      inputLabel: 'Motivo',
      inputValue: isActive ? 'Serie desactivada temporalmente.' : 'Serie activada nuevamente.',
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
          this.seriesService
            .updateSerieEstado(idSerie, {
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
        text: isActive ? 'La serie fue desactivada correctamente.' : 'La serie fue activada correctamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadSeries(this.pagination().page);
    });
  }

  onDeleteRequested(row: Record<string, string>): void {
    const idSerie = row['idSerie'];
    const serie = row['serie'] || 'serie';

    if (!idSerie) {
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Eliminar serie',
      text: `Se eliminará la serie ${serie}. Si tiene comprobantes emitidos, el backend rechazará la operación.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      preConfirm: () => {
        return new Promise<void>((resolve, reject) => {
          this.seriesService.deleteSerie(idSerie).subscribe({
            next: () => resolve(),
            error: (error: unknown) => reject(new Error(this.extractErrorMessage(error) || 'No se pudo eliminar la serie.')),
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
        title: 'Serie eliminada',
        text: 'La serie fue eliminada correctamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadSeries(this.pagination().page);
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

    this.loadSeries(0);
  }

  goToPage(pageNumber: number): void {
    const totalPages = this.pagination().totalPages;

    if (this.isLoading() || pageNumber < 0 || pageNumber >= totalPages || pageNumber === this.pagination().page) {
      return;
    }

    this.loadSeries(pageNumber);
  }

  get skeletonRows(): number {
    const size = Number(this.filtersForm.controls.pageSize.value);
    return Number.isFinite(size) && size > 0 ? size : this.defaultPageSize;
  }

  private submitEditSerie(payload: SerieFormModalPayload): void {
    const editingId = this.editingSerieId();

    if (!editingId) {
      return;
    }

    this.isSaving.set(true);

    this.seriesService.updateSerie(editingId, payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Serie actualizada',
          text: response.message || 'Los cambios se guardaron correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeSerieForm();
        this.loadSeries(this.pagination().page);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.showError('Error al actualizar', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
      },
    });
  }

  private loadSeries(page: number): void {
    this.isLoading.set(true);

    const { tipoComprobante, serie, estado, pageSize } = this.filtersForm.getRawValue();
    const currentLimit = Number(pageSize) || this.defaultPageSize;

    this.seriesService
      .getSeries({
        page,
        size: currentLimit,
        tipoComprobante,
        serie,
        estado: estado as 'ACTIVO' | 'INACTIVO' | '',
      })
      .subscribe({
        next: (response) => {
          this.pagination.set({
            page,
            limit: currentLimit,
            total: response.meta?.total ?? response.data?.length ?? 0,
            totalPages: response.meta?.totalPages ?? 1,
          });

          this.rows.set((response.data ?? []).map((item) => this.toTableRow(item)));
          this.isLoading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.isLoading.set(false);
        },
      });
  }

  private toTableRow(item: SerieComprobanteListItem): Record<string, string> {
    return {
      idSerie: String(item.idSerie),
      tipoComprobante: item.tipoComprobante,
      tipoComprobanteLabel: this.formatTipoComprobante(item.tipoComprobante),
      serie: item.serie,
      correlativoActual: String(item.correlativoActual),
      descripcion: item.descripcion || '-',
      estado: this.formatStatus(item.estadoTexto || (item.estado ? 'ACTIVO' : 'INACTIVO')),
      createdAt: this.formatDate(item.createdAt),
    };
  }

  private formatTipoComprobante(value: string): string {
    return this.tipoComprobanteOptions.find((option) => option.value === value)?.label ?? value;
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

