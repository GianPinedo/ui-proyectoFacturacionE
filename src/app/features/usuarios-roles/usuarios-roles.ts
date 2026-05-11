import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { TableColumn } from '../../core/models/table-column.model';
import { UsuariosListMeta } from '../../core/models/usuario.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { CreateUserModalComponent, CreateUserModalPayload } from './components/create-user-modal/create-user-modal';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-usuarios-roles',
  imports: [ReactiveFormsModule, LucideAngularModule, PageTitleComponent, UiButtonComponent, UiCardComponent, UiTableComponent, UiPaginationComponent, CreateUserModalComponent],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css',
})
export class UsuariosRolesComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Usuarios y roles';
  readonly subtitle = 'Gestiona usuarios, roles y accesos del sistema.';

  readonly roles = signal<string[]>([]);
  readonly createRoleOptions = signal<Array<{ id: number; label: string }>>([]);
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
    { key: 'acciones', label: 'Acciones' },
  ];

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);
  readonly isSavingUser = signal(false);
  readonly isCreateUserOpen = signal(false);

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsuarios(0);
  }

  onSearch(): void {
    this.loadUsuarios(0);
  }

  openCreateUserForm(): void {
    this.isCreateUserOpen.set(true);
  }

  closeCreateUserForm(): void {
    this.isCreateUserOpen.set(false);
  }

  submitCreateUser(payload: CreateUserModalPayload): void {
    this.isSavingUser.set(true);

    const createPayload = {
      ...payload,
      idRol: Number(payload.idRol),
    };

    const { confirmarPassword: _confirmarPassword, estado: _estado, ...requestPayload } = createPayload;

    this.usuariosService.createUsuario(requestPayload).subscribe({
      next: (response) => {
        this.isSavingUser.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: response.message || 'El usuario fue registrado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeCreateUserForm();
        this.loadUsuarios(0);
      },
      error: (error: unknown) => {
        this.isSavingUser.set(false);

        const message = this.extractErrorMessage(error) || 'No se pudo crear el usuario.';

        void Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
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

  onEditRequested(row: Record<string, string>): void {
    const username = row['username'] || 'usuario';

    void Swal.fire({
      icon: 'info',
      title: 'Editar usuario',
      text: `Acción pendiente para ${username}.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#00AD8F',
    });
  }

  onDeleteRequested(row: Record<string, string>): void {
    const username = row['username'] || 'usuario';

    void Swal.fire({
      icon: 'warning',
      title: 'Eliminar usuario',
      text: `Acción pendiente para ${username}.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#00AD8F',
    });
  }

  onDisableAccessRequested(row: Record<string, string>): void {
    const username = row['username'] || 'usuario';

    void Swal.fire({
      icon: 'warning',
      title: 'Desactivar acceso',
      text: `Acción pendiente para ${username}.`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#00AD8F',
    });
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
            idUsuario: item.idUsuario,
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

  private loadRoles(): void {
    this.usuariosService
      .getRoles({
        page: 0,
        size: 10,
      })
      .subscribe({
        next: (response) => {
          const activeRoles = response.data
            .filter((role) => role.estado?.toUpperCase() === 'ACTIVO')
            .map((role) => ({
              id: Number(role.idRol),
              label: this.formatRole(role.nombre),
              rawName: role.nombre,
            }))
            .filter((role) => Number.isFinite(role.id) && role.id > 0);

          this.roles.set(activeRoles.map((role) => role.rawName));
          this.createRoleOptions.set(activeRoles.map(({ id, label }) => ({ id, label })));
        },
        error: () => {
          this.roles.set([]);
          this.createRoleOptions.set([]);
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
