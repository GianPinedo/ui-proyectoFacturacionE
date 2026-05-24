import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import { AuditoriaListItem, UsuariosListMeta } from '../../core/models/usuario.model';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PageTitleComponent,
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
    UiPaginationComponent,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Auditoría';
  readonly subtitle = 'Revisa la trazabilidad de operaciones críticas.';
  readonly searchIcon = Search;
  readonly defaultPageSize = 10;
  readonly pageSizeOptions = [10, 20, 50, 100];
  readonly skeletonRows = 10;
  readonly userPickerPageSizeOptions = [5, 10, 20];
  readonly accionOptions = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CAMBIAR_ESTADO'];

  readonly columns: TableColumn[] = [
    { key: 'idAuditoria', label: 'ID' },
    { key: 'idUsuario', label: 'Usuario' },
    { key: 'modulo', label: 'Módulo' },
    { key: 'accion', label: 'Acción' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'entidad', label: 'Entidad' },
    { key: 'idEntidad', label: 'ID entidad' },
    { key: 'fecha', label: 'Fecha' },
  ];

  readonly userColumns: TableColumn[] = [
    { key: 'nombreCompleto', label: 'Nombre completo' },
    { key: 'username', label: 'Usuario' },
    { key: 'correo', label: 'Correo' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
  ];

  readonly filtersForm = this.fb.nonNullable.group({
    accion: [''],
    idUsuario: [''],
    fechaDesde: [this.getInitialDateFromValue()],
    fechaHasta: [this.getInitialDateToValue()],
    pageSize: [this.defaultPageSize],
  });

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);
  readonly selectedUsuarioLabel = signal('');

  readonly userPickerForm = this.fb.nonNullable.group({
    buscar: [''],
    pageSize: [10],
  });

  readonly isUserPickerOpen = signal(false);
  readonly isUserPickerLoading = signal(false);
  readonly userPickerRows = signal<Record<string, string>[]>([]);
  readonly userPickerPagination = signal<UsuariosListMeta>({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadAuditoria(0);
  }

  onSearch(): void {
    this.loadAuditoria(0);
  }

  openUserPicker(): void {
    this.isUserPickerOpen.set(true);
    this.loadUserPickerUsers(0);
  }

  closeUserPicker(): void {
    this.isUserPickerOpen.set(false);
  }

  searchUserPicker(): void {
    this.loadUserPickerUsers(0);
  }

  clearUserPickerSearch(): void {
    this.userPickerForm.reset({
      buscar: '',
      pageSize: this.userPickerPagination().limit || 10,
    });

    this.loadUserPickerUsers(0);
  }

  onUserPickerPageSizeChange(size: number): void {
    this.userPickerForm.controls.pageSize.setValue(size);

    if (!Number.isFinite(size) || size <= 0) {
      return;
    }

    this.userPickerPagination.update((current) => ({
      ...current,
      page: 0,
      limit: size,
    }));

    this.loadUserPickerUsers(0);
  }

  goToUserPickerPage(pageNumber: number): void {
    const targetIndex = pageNumber;
    const totalPages = this.userPickerPagination().totalPages;

    if (targetIndex < 0 || (totalPages > 0 && targetIndex >= totalPages)) {
      return;
    }

    this.loadUserPickerUsers(targetIndex);
  }

  onUserSelected(row: Record<string, string>): void {
    const idUsuario = row['idUsuario'];

    if (!idUsuario) {
      return;
    }

    const label = `${row['nombreCompleto'] || ''} (${row['username'] || '-'})`.trim();
    this.filtersForm.controls.idUsuario.setValue(idUsuario);
    this.selectedUsuarioLabel.set(label);
    this.closeUserPicker();
  }

  clearSelectedUsuario(): void {
    this.filtersForm.controls.idUsuario.setValue('');
    this.selectedUsuarioLabel.set('');
  }

  clearFilters(): void {
    this.filtersForm.reset({
      accion: '',
      idUsuario: '',
      fechaDesde: this.getInitialDateFromValue(),
      fechaHasta: this.getInitialDateToValue(),
      pageSize: this.defaultPageSize,
    });

    this.selectedUsuarioLabel.set('');

    this.loadAuditoria(0);
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

    this.loadAuditoria(0);
  }

  goToPage(pageNumber: number): void {
    const targetIndex = pageNumber;
    const totalPages = this.pagination().totalPages;

    if (targetIndex < 0 || (totalPages > 0 && targetIndex >= totalPages)) {
      return;
    }

    this.loadAuditoria(targetIndex);
  }

  private loadAuditoria(page: number): void {
    const { accion, idUsuario, fechaDesde, fechaHasta, pageSize } = this.filtersForm.getRawValue();

    this.isLoading.set(true);

    this.usuariosService
      .getAuditoria({
        page,
        size: pageSize,
        accion: accion?.trim().toUpperCase() || undefined,
        idUsuario: this.toOptionalNumber(idUsuario),
        fechaDesde: this.toIsoFromDateTimeLocal(fechaDesde, false),
        fechaHasta: this.toIsoFromDateTimeLocal(fechaHasta, true),
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          const data = response.data || [];
          this.rows.set(data.map((item) => this.toRow(item)));

          const meta = response.meta;
          this.pagination.set({
            page,
            limit: meta?.limit ?? pageSize,
            total: meta?.total ?? data.length,
            totalPages: meta?.totalPages ?? 1,
          });
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          this.rows.set([]);
          this.pagination.set({
            page,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          });

          void Swal.fire({
            icon: 'error',
            title: 'Error al cargar auditoría',
            text: this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#00AD8F',
          });
        },
      });
  }

  private loadUserPickerUsers(page: number): void {
    const { buscar, pageSize } = this.userPickerForm.getRawValue();

    this.isUserPickerLoading.set(true);

    this.usuariosService
      .getUsuarios({
        page,
        size: pageSize,
        buscar: buscar || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isUserPickerLoading.set(false);

          this.userPickerRows.set(
            (response.data || []).map((item) => ({
              idUsuario: item.idUsuario,
              nombreCompleto: `${item.nombres} ${item.apellidos}`.trim(),
              username: item.username,
              correo: item.correo,
              rol: item.rol,
              estado: item.estado,
            })),
          );

          this.userPickerPagination.set({
            page,
            limit: response.meta?.limit ?? pageSize,
            total: response.meta?.total ?? response.data?.length ?? 0,
            totalPages: response.meta?.totalPages ?? 1,
          });
        },
        error: () => {
          this.isUserPickerLoading.set(false);
          this.userPickerRows.set([]);
          this.userPickerPagination.set({
            page,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          });
        },
      });
  }

  private toRow(item: AuditoriaListItem): Record<string, string> {
    return {
      idAuditoria: String(item.idAuditoria ?? '-'),
      idUsuario: String(item.idUsuario ?? '-'),
      modulo: item.modulo || '-',
      accion: item.accion || '-',
      descripcion: item.descripcion || '-',
      entidad: item.entidad || '-',
      idEntidad: String(item.idEntidad ?? '-'),
      fecha: this.formatDate(item.fecha),
    };
  }

  private toOptionalNumber(rawValue: unknown): number | undefined {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return undefined;
    }

    if (typeof rawValue === 'number') {
      return Number.isFinite(rawValue) ? rawValue : undefined;
    }

    const normalized = String(rawValue).trim();

    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toIsoFromDateTimeLocal(rawValue: string, useEndOfMinute: boolean): string | undefined {
    if (!rawValue?.trim()) {
      return undefined;
    }

    const date = new Date(rawValue);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (useEndOfMinute) {
      date.setSeconds(59, 999);
    } else {
      date.setSeconds(0, 0);
    }

    return date.toISOString();
  }

  private getInitialDateFromValue(): string {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return this.toDateTimeLocalValue(date);
  }

  private getInitialDateToValue(): string {
    const date = new Date();
    date.setHours(23, 59, 0, 0);
    return this.toDateTimeLocalValue(date);
  }

  private toDateTimeLocalValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
