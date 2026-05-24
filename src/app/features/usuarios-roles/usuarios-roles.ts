import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import { TableColumn } from '../../core/models/table-column.model';
import { ModuloListItem, ModuloPermisoRolItem, UsuariosListMeta } from '../../core/models/usuario.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { CreateUserModalComponent, UserFormModalInitialData, UserFormModalMode, UserFormModalPayload } from './components/create-user-modal/create-user-modal';
import { CreateRolModalComponent, CreateRolModalInitialData, CreateRolModalMode, CreateRolModalPayload } from './components/create-rol-modal/create-rol-modal';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import { UiPaginationComponent } from '../../shared/components/ui-pagination/ui-pagination';
import { UiTableComponent } from '../../shared/components/ui-table/ui-table';

@Component({
  selector: 'app-usuarios-roles',
  imports: [ReactiveFormsModule, LucideAngularModule, PageTitleComponent, UiButtonComponent, UiCardComponent, UiTableComponent, UiPaginationComponent, CreateUserModalComponent, CreateRolModalComponent],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css',
})
export class UsuariosRolesComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly viewMode = signal<'both' | 'usuarios' | 'roles'>('both');
  readonly currentTab = signal<'usuarios' | 'roles'>('usuarios');
  readonly showTabs = computed(() => this.viewMode() === 'both');
  readonly title = computed(() => {
    const mode = this.viewMode();

    if (mode === 'usuarios') {
      return 'Usuarios';
    }

    if (mode === 'roles') {
      return 'Roles';
    }

    return 'Usuarios y roles';
  });
  readonly subtitle = computed(() => {
    const mode = this.viewMode();

    if (mode === 'usuarios') {
      return 'Gestiona usuarios y accesos del sistema.';
    }

    if (mode === 'roles') {
      return 'Gestiona roles y permisos del sistema.';
    }

    return 'Gestiona usuarios, roles y accesos del sistema.';
  });
  readonly showUsuariosSection = computed(
    () => this.viewMode() === 'usuarios' || (this.viewMode() === 'both' && this.currentTab() === 'usuarios'),
  );
  readonly showRolesSection = computed(
    () => this.viewMode() === 'roles' || (this.viewMode() === 'both' && this.currentTab() === 'roles'),
  );

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

  readonly rolesFiltersForm = this.fb.nonNullable.group({
    buscar: [''],
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

  readonly rolesColumns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Creado' },
    { key: 'acciones', label: 'Acciones' },
  ];

  readonly rows = signal<Record<string, string>[]>([]);
  readonly isLoading = signal(false);
  readonly isSavingUser = signal(false);
  readonly isLoadingUserData = signal(false);
  readonly isUserModalOpen = signal(false);
  readonly userModalMode = signal<UserFormModalMode>('create');
  readonly editingUserId = signal<string | null>(null);
  readonly userModalInitialData = signal<UserFormModalInitialData | null>(null);
  
  readonly rolesData = signal<Record<string, string>[]>([]);
  readonly isSavingRol = signal(false);
  readonly isRolModalOpen = signal(false);
  readonly modulesForRoleForm = signal<ModuloListItem[]>([]);
  readonly modulesForRoleFormLoading = signal(false);
  readonly rolModalMode = signal<CreateRolModalMode>('create');
  readonly editingRolId = signal<string | null>(null);
  readonly rolModalInitialData = signal<CreateRolModalInitialData | undefined>(undefined);
  readonly rolesLoading = signal(false);
  readonly isRoleModulesModalOpen = signal(false);
  readonly roleModulesLoading = signal(false);
  readonly roleModules = signal<ModuloPermisoRolItem[]>([]);
  readonly roleModulesTreeRows = computed(() => {
    const tree = this.buildRoleModulesTree(this.roleModules());
    return this.flattenRoleModuleTree(tree);
  });
  readonly selectedRoleName = signal('');
  readonly rolesPagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });
  
  private readonly roleCatalog = signal<Array<{ id: number; label: string; rawName: string }>>([]);

  readonly pagination = signal<UsuariosListMeta>({
    page: 0,
    limit: this.defaultPageSize,
    total: 0,
    totalPages: 0,
  });

  ngOnInit(): void {
    const configuredTab = this.route.snapshot.data['tab'] as 'usuarios' | 'roles' | undefined;

    if (configuredTab === 'usuarios' || configuredTab === 'roles') {
      this.viewMode.set(configuredTab);
      this.currentTab.set(configuredTab);
    }

    this.loadRoles();
    this.loadUsuarios(0);
    this.loadRolesData(0);
  }

  onSearch(): void {
    this.loadUsuarios(0);
  }

  openCreateUserForm(): void {
    this.userModalMode.set('create');
    this.editingUserId.set(null);
    this.userModalInitialData.set(null);
    this.isUserModalOpen.set(true);
  }

  closeCreateUserForm(): void {
    this.isUserModalOpen.set(false);
    this.editingUserId.set(null);
    this.userModalInitialData.set(null);
  }

  submitCreateUser(payload: UserFormModalPayload): void {
    if (this.userModalMode() === 'edit') {
      this.submitEditUser(payload);
      return;
    }

    this.isSavingUser.set(true);

    const createPayload = {
      ...payload,
      idRol: Number(payload.idRol),
    };

    if (!createPayload.username || !createPayload.password) {
      this.isSavingUser.set(false);
      return;
    }

    const requestPayload = {
      idRol: createPayload.idRol,
      nombres: createPayload.nombres,
      apellidos: createPayload.apellidos,
      correo: createPayload.correo,
      username: createPayload.username,
      password: createPayload.password,
    };

    this.usuariosService.createUsuario(requestPayload).subscribe({
      next: (response) => {
        this.isSavingUser.set(false);

        void Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: response.message || AppMessages.USER_CREATE_SUCCESS,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });

        this.closeCreateUserForm();
        this.loadUsuarios(0);
      },
      error: (error: unknown) => {
        this.isSavingUser.set(false);

        const message = this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR;

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

  private submitEditUser(payload: UserFormModalPayload): void {
    const editingId = this.editingUserId();

    if (!editingId) {
      return;
    }

    this.isSavingUser.set(true);

    this.usuariosService
      .updateUsuario(editingId, {
        idRol: Number(payload.idRol),
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        correo: payload.correo,
      })
      .subscribe({
        next: (response) => {
          this.isSavingUser.set(false);

          void Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: response.message || AppMessages.USER_UPDATE_SUCCESS,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00AD8F',
          });

          this.closeCreateUserForm();
          this.loadUsuarios(this.pagination().page);
        },
        error: (error: unknown) => {
          this.isSavingUser.set(false);

          const message = this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR;

          void Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
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
    const idUsuario = row['idUsuario'];

    if (!idUsuario) {
      return;
    }

    this.userModalMode.set('edit');
    this.editingUserId.set(idUsuario);
    this.isUserModalOpen.set(true);
    this.isLoadingUserData.set(true);

    this.usuariosService.getUsuarioById(idUsuario).subscribe({
      next: (response) => {
        this.isLoadingUserData.set(false);
        const user = response.data;

        const roleId = this.resolveRoleId(user.rol);

        this.userModalInitialData.set({
          idRol: roleId,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          username: user.username,
          estado: user.estado?.toUpperCase() === 'ACTIVO',
        });
      },
      error: (error: unknown) => {
        this.isLoadingUserData.set(false);
        this.closeCreateUserForm();

        const message = this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR;
        void Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuario',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  onResetPasswordRequested(row: Record<string, string>): void {
    const idUsuario = row['idUsuario'];
    const username = row['username'] || 'usuario';

    if (!idUsuario) {
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Restablecer contraseña',
      text: `Se restablecerá la contraseña de ${username}.`,
      input: 'text',
      inputLabel: 'Nueva contraseña temporal',
      inputValue: 'Temporal123*',
      inputPlaceholder: 'Ingresa la nueva contraseña temporal',
      inputValidator: (value) => {
        if (!value?.trim()) {
          return AppMessages.USER_PASSWORD_REQUIRED;
        }

        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      preConfirm: (passwordNuevo) => {
        return new Promise<void>((resolve, reject) => {
          this.usuariosService
            .resetUsuarioPassword(idUsuario, {
              passwordNuevo: String(passwordNuevo ?? '').trim(),
            })
            .subscribe({
              next: () => resolve(),
              error: (error: unknown) => reject(new Error(this.extractErrorMessage(error) || AppMessages.GENERIC_PASSWORD_RESET_ERROR)),
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
        title: 'Contraseña restablecida',
        text: AppMessages.USER_PASSWORD_RESET_SUCCESS,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });
    });
  }

  onDisableAccessRequested(row: Record<string, string>): void {
    const idUsuario = row['idUsuario'];
    const username = row['username'] || 'usuario';

    if (!idUsuario) {
      return;
    }

    const currentEstado = (row['estado'] || '').toUpperCase();
    const isActive = currentEstado === 'ACTIVO';
    const nextEstado = isActive ? 'INACTIVO' : 'ACTIVO';

    void Swal.fire({
      icon: 'warning',
      title: isActive ? 'Desactivar usuario' : 'Activar usuario',
      text: isActive
        ? `Se desactivará el acceso de ${username}.`
        : `Se activará el acceso de ${username}.`,
      input: 'textarea',
      inputLabel: 'Motivo',
      inputValue: isActive
        ? 'Usuario desactivado por cese de funciones.'
        : 'Usuario activado nuevamente.',
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
            .updateUsuarioEstado(idUsuario, {
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
        text: isActive ? AppMessages.USER_STATUS_DISABLED_SUCCESS : AppMessages.USER_STATUS_ENABLED_SUCCESS,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadUsuarios(this.pagination().page);
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
          this.pagination.set({
            page,
            limit: currentLimit,
            total: response.meta?.total ?? response.data?.length ?? 0,
            totalPages: response.meta?.totalPages ?? 1,
          });

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
          this.roleCatalog.set(activeRoles);
        },
        error: () => {
          this.roles.set([]);
          this.createRoleOptions.set([]);
          this.roleCatalog.set([]);
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

  private resolveRoleId(roleName: string): number {
    const normalized = roleName?.toUpperCase().trim();
    const matched = this.roleCatalog().find((role) => role.rawName === normalized);
    return matched?.id ?? 0;
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

  // Métodos para gestionar roles

  openCreateRolForm(): void {
    this.rolModalMode.set('create');
    this.editingRolId.set(null);
    this.rolModalInitialData.set(undefined);
    this.loadRolesData(0);
    this.loadModulesForRoleForm();
    this.isRolModalOpen.set(true);
  }

  closeCreateRolForm(): void {
    this.isRolModalOpen.set(false);
    this.editingRolId.set(null);
    this.rolModalInitialData.set(undefined);
  }

  submitCreateRol(payload: CreateRolModalPayload): void {
    if (this.rolModalMode() === 'edit') {
      this.submitEditRol(payload);
      return;
    }

    this.isSavingRol.set(true);

    const requestPayload = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      modulosIds: payload.modulosIds,
      permisoLectura: payload.permisoLectura,
      permisoCreacion: payload.permisoCreacion,
      permisoActualizacion: payload.permisoActualizacion,
      permisoBorracion: payload.permisoBorracion,
    };

    this.usuariosService.createRol(requestPayload).subscribe({
      next: (response) => {
        const createdRoleId = this.extractCreatedRoleId(response.data);

        if (!createdRoleId || payload.modulosIds.length === 0) {
          this.isSavingRol.set(false);

          void Swal.fire({
            icon: 'success',
            title: 'Rol creado',
            text: response.message || AppMessages.ROL_CREATE_SUCCESS,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00AD8F',
          });

          this.closeCreateRolForm();
          this.loadRolesData(0);
          return;
        }

        this.usuariosService
          .asignarModulosPermisosRol({
            idRol: createdRoleId,
            modulosIds: payload.modulosIds,
            permisoLectura: payload.permisoLectura,
            permisoCreacion: payload.permisoCreacion,
            permisoActualizacion: payload.permisoActualizacion,
            permisoBorracion: payload.permisoBorracion,
          })
          .subscribe({
            next: () => {
              this.isSavingRol.set(false);

              void Swal.fire({
                icon: 'success',
                title: 'Rol creado',
                text: response.message || AppMessages.ROL_CREATE_SUCCESS,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00AD8F',
              });

              this.closeCreateRolForm();
              this.loadRolesData(0);
            },
            error: (assignError: unknown) => {
              this.isSavingRol.set(false);

              const message = this.extractErrorMessage(assignError) || AppMessages.GENERIC_SAVE_ERROR;

              void Swal.fire({
                icon: 'error',
                title: 'Rol creado sin módulos',
                text: message,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#00AD8F',
              });

              this.closeCreateRolForm();
              this.loadRolesData(0);
            },
          });
      },
      error: (error: unknown) => {
        this.isSavingRol.set(false);

        const message = this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR;

        void Swal.fire({
          icon: 'error',
          title: 'Error al crear rol',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  private loadModulesForRoleForm(): void {
    this.modulesForRoleFormLoading.set(true);

    this.usuariosService
      .getModulos({
        page: 0,
        size: 10,
        estado: 'ACTIVO',
      })
      .subscribe({
        next: (response) => {
          this.modulesForRoleForm.set(response.data ?? []);
          this.modulesForRoleFormLoading.set(false);
        },
        error: () => {
          this.modulesForRoleForm.set([]);
          this.modulesForRoleFormLoading.set(false);
        },
      });
  }

  private extractCreatedRoleId(data: unknown): number | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const candidate = (data as { idRol?: unknown; id?: unknown }).idRol ?? (data as { id?: unknown }).id;
    const value = Number(candidate);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private submitEditRol(payload: CreateRolModalPayload): void {
    const editingId = this.editingRolId();

    if (!editingId) {
      return;
    }

    this.isSavingRol.set(true);

    const requestPayload = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
    };

    this.usuariosService.updateRol(editingId, requestPayload).subscribe({
      next: (response) => {
        const numericRoleId = Number(editingId);

        if (!Number.isFinite(numericRoleId) || numericRoleId <= 0) {
          this.isSavingRol.set(false);

          void Swal.fire({
            icon: 'success',
            title: 'Rol actualizado',
            text: response.message || AppMessages.ROL_UPDATE_SUCCESS,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00AD8F',
          });

          this.closeCreateRolForm();
          this.loadRolesData(this.rolesPagination().page);
          return;
        }

        this.usuariosService
          .asignarModulosPermisosRol({
            idRol: numericRoleId,
            modulosIds: payload.modulosIds,
            permisoLectura: payload.permisoLectura,
            permisoCreacion: payload.permisoCreacion,
            permisoActualizacion: payload.permisoActualizacion,
            permisoBorracion: payload.permisoBorracion,
          })
          .subscribe({
            next: () => {
              this.isSavingRol.set(false);

              void Swal.fire({
                icon: 'success',
                title: 'Rol actualizado',
                text: response.message || AppMessages.ROL_UPDATE_SUCCESS,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00AD8F',
              });

              this.closeCreateRolForm();
              this.loadRolesData(this.rolesPagination().page);
            },
            error: (assignError: unknown) => {
              this.isSavingRol.set(false);

              const message = this.extractErrorMessage(assignError) || AppMessages.GENERIC_UPDATE_ERROR;

              void Swal.fire({
                icon: 'error',
                title: 'Rol actualizado sin módulos',
                text: message,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#00AD8F',
              });

              this.closeCreateRolForm();
              this.loadRolesData(this.rolesPagination().page);
            },
          });
      },
      error: (error: unknown) => {
        this.isSavingRol.set(false);

        const message = this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR;

        void Swal.fire({
          icon: 'error',
          title: 'Error al actualizar rol',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  loadRolesData(page: number): void {
    const search = this.rolesFiltersForm.getRawValue().buscar?.trim() || '';
    const size = this.rolesFiltersForm.getRawValue().pageSize || this.defaultPageSize;

    this.rolesLoading.set(true);

    this.usuariosService
      .getRoles({
        page,
        size,
        nombre: search,
      })
      .subscribe({
        next: (response) => {
          this.rolesLoading.set(false);

          const rolesFormatted: Record<string, string>[] = response.data.map((rol) => ({
            idRol: rol.idRol,
            nombre: rol.nombre,
            descripcion: rol.descripcion || '-',
            estado: rol.estado,
            createdAt: this.formatDate(rol.createdAt),
          }));

          this.rolesData.set(rolesFormatted);
          this.rolesPagination.set({
            page,
            limit: size,
            total: response.meta?.total ?? response.data.length,
            totalPages: response.meta?.totalPages ?? 1,
          });
        },
        error: (error: unknown) => {
          this.rolesLoading.set(false);

          const message = this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR;

          void Swal.fire({
            icon: 'error',
            title: 'Error al cargar roles',
            text: message,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#00AD8F',
          });
        },
      });
  }

  onRolesSearch(): void {
    this.loadRolesData(0);
  }

  clearRolesFilters(): void {
    this.rolesFiltersForm.reset({
      buscar: '',
      pageSize: this.defaultPageSize,
    });

    this.loadRolesData(0);
  }

  onRolesPageSizeChange(size: number): void {
    this.rolesFiltersForm.controls.pageSize.setValue(size);

    if (!Number.isFinite(size) || size <= 0) {
      return;
    }

    this.rolesPagination.update((current) => ({
      ...current,
      limit: size,
      page: 0,
    }));

    this.loadRolesData(0);
  }

  goToRolesPage(pageNumber: number): void {
    const targetIndex = pageNumber;
    const totalPages = this.rolesPagination().totalPages;

    if (this.rolesLoading() || targetIndex < 0 || targetIndex >= totalPages || targetIndex === this.rolesPagination().page) {
      return;
    }

    this.loadRolesData(targetIndex);
  }

  onDisableRoleRequested(row: Record<string, string>): void {
    const idRol = row['idRol'];
    const roleName = row['nombre'] || 'rol';

    if (!idRol) {
      return;
    }

    const currentEstado = (row['estado'] || '').toUpperCase();
    const isActive = currentEstado === 'ACTIVO';
    const nextEstado = isActive ? 'INACTIVO' : 'ACTIVO';

    void Swal.fire({
      icon: 'warning',
      title: isActive ? 'Desactivar rol' : 'Activar rol',
      text: isActive
        ? `Se desactivará el rol ${roleName}.`
        : `Se activará el rol ${roleName}.`,
      input: 'textarea',
      inputLabel: 'Motivo',
      inputValue: isActive
        ? 'Rol deshabilitado temporalmente.'
        : 'Rol habilitado nuevamente.',
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
            .updateRolEstado(idRol, {
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
        text: isActive ? AppMessages.ROL_STATUS_DISABLED_SUCCESS : AppMessages.ROL_STATUS_ENABLED_SUCCESS,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00AD8F',
      });

      this.loadRolesData(this.rolesPagination().page);
    });
  }

  onEditRolRequested(row: Record<string, string>): void {
    const idRol = row['idRol'];

    if (!idRol) {
      return;
    }

    this.rolModalMode.set('edit');
    this.editingRolId.set(idRol);
    this.loadModulesForRoleForm();
    this.isRolModalOpen.set(true);

    this.rolModalInitialData.set({
      idRol: idRol,
      nombre: row['nombre'] || '',
      descripcion: row['descripcion'] || '',
    });

    this.usuariosService.getRolById(idRol).subscribe({
      next: (detailResponse) => {
        const role = detailResponse.data;

        this.rolModalInitialData.update((current) => ({
          ...(current ?? { idRol }),
          idRol,
          nombre: role?.nombre || row['nombre'] || '',
          descripcion: role?.descripcion || row['descripcion'] || '',
        }));
      },
      error: () => {
        this.rolModalInitialData.update((current) => ({
          ...(current ?? { idRol }),
          idRol,
          nombre: row['nombre'] || '',
          descripcion: row['descripcion'] || '',
        }));
      },
    });

    this.usuariosService.getModulosPermisosPorRol(idRol).subscribe({
      next: (response) => {
        const modules = response.data || [];
        const first = modules[0];

        this.rolModalInitialData.update((current) => ({
          ...(current ?? { idRol }),
          idRol: idRol,
          nombre: current?.nombre || row['nombre'] || '',
          descripcion: current?.descripcion || row['descripcion'] || '',
          modulosIds: modules
            .map((item) => Number(item.idModulo))
            .filter((value) => Number.isFinite(value) && value > 0),
          permisoLectura: first?.permisoLectura ?? true,
          permisoCreacion: first?.permisoCreacion ?? true,
          permisoActualizacion: first?.permisoActualizacion ?? true,
          permisoBorracion: first?.permisoBorracion ?? false,
        }));
      },
      error: () => {
        this.rolModalInitialData.update((current) => ({
          ...(current ?? { idRol }),
          idRol: idRol,
          nombre: current?.nombre || row['nombre'] || '',
          descripcion: current?.descripcion || row['descripcion'] || '',
          modulosIds: [],
          permisoLectura: true,
          permisoCreacion: true,
          permisoActualizacion: true,
          permisoBorracion: false,
        }));
      },
    });
  }

  onViewRoleModulesRequested(row: Record<string, string>): void {
    const idRol = row['idRol'];

    if (!idRol) {
      return;
    }

    this.selectedRoleName.set(row['nombre'] || 'Rol');
    this.roleModules.set([]);
    this.roleModulesLoading.set(true);
    this.isRoleModulesModalOpen.set(true);

    this.usuariosService.getModulosPermisosPorRol(idRol).subscribe({
      next: (response) => {
        this.roleModules.set(response.data || []);
        this.roleModulesLoading.set(false);
      },
      error: (error: unknown) => {
        this.roleModulesLoading.set(false);
        this.roleModules.set([]);

        const message = this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR;

        void Swal.fire({
          icon: 'error',
          title: 'Error al cargar módulos',
          text: message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00AD8F',
        });
      },
    });
  }

  closeRoleModulesModal(): void {
    this.isRoleModulesModalOpen.set(false);
    this.roleModulesLoading.set(false);
    this.roleModules.set([]);
    this.selectedRoleName.set('');
  }

  private buildRoleModulesTree(modules: ModuloPermisoRolItem[]): Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }> {
    const nodes = modules.map((module) => ({
      ...module,
      idModuloPadre: (module as ModuloPermisoRolItem & { idModuloPadre?: string | number | null }).idModuloPadre ?? null,
      hijos: [] as ModuloPermisoRolItem[],
    }));

    const byId = new Map(nodes.map((node) => [node.idModulo, node]));
    const byRoute = new Map<string, (typeof nodes)[number]>();

    for (const node of nodes) {
      const normalizedRoute = this.normalizeRoute(node.ruta);
      if (normalizedRoute) {
        byRoute.set(normalizedRoute, node);
      }
    }

    const attached = new Set<string | number>();

    for (const node of nodes) {
      const explicitParentId = node.idModuloPadre;

      if (!explicitParentId) {
        continue;
      }

      const parent = byId.get(explicitParentId);

      if (!parent || parent.idModulo === node.idModulo) {
        continue;
      }

      parent.hijos.push(node);
      attached.add(node.idModulo);
    }

    for (const node of nodes) {
      if (attached.has(node.idModulo) || node.idModuloPadre) {
        continue;
      }

      const parentRoute = this.getParentRoute(node.ruta);

      if (!parentRoute) {
        continue;
      }

      const parent = byRoute.get(parentRoute);

      if (!parent || parent.idModulo === node.idModulo) {
        continue;
      }

      parent.hijos.push(node);
      attached.add(node.idModulo);
    }

    const roots = nodes.filter((node) => !attached.has(node.idModulo));

    const sortByOrder = (left: ModuloPermisoRolItem, right: ModuloPermisoRolItem): number => {
      const leftOrder = Number(left.orden) || 0;
      const rightOrder = Number(right.orden) || 0;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.nombre.localeCompare(right.nombre);
    };

    const sortTree = (items: Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }>): void => {
      items.sort(sortByOrder);
      for (const item of items) {
        const childNodes = item.hijos as Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }>;
        if (childNodes.length > 0) {
          sortTree(childNodes);
        }
      }
    };

    sortTree(roots);

    return roots;
  }

  private flattenRoleModuleTree(tree: Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }>): Array<{ module: ModuloPermisoRolItem; level: number }> {
    const rows: Array<{ module: ModuloPermisoRolItem; level: number }> = [];

    const traverse = (nodes: Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }>, level: number): void => {
      for (const node of nodes) {
        rows.push({ module: node, level });

        const children = node.hijos as Array<ModuloPermisoRolItem & { idModuloPadre?: string | number | null; hijos: ModuloPermisoRolItem[] }>;
        if (children.length > 0) {
          traverse(children, level + 1);
        }
      }
    };

    traverse(tree, 0);
    return rows;
  }

  private normalizeRoute(route: string | null | undefined): string {
    if (!route) {
      return '';
    }

    const cleaned = route.trim().replace(/\/+$/, '');
    return cleaned === '/' ? '' : cleaned;
  }

  private getParentRoute(route: string | null | undefined): string {
    const normalized = this.normalizeRoute(route);

    if (!normalized || !normalized.includes('/')) {
      return '';
    }

    const index = normalized.lastIndexOf('/');

    if (index <= 0) {
      return '';
    }

    return normalized.slice(0, index);
  }

}

