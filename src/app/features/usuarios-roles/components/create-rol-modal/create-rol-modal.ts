import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, ChevronDown, ChevronRight, X } from 'lucide-angular';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

export type CreateRolModalMode = 'create' | 'edit';

export interface CreateRolModalInitialData {
  idRol?: string;
  nombre?: string;
  descripcion?: string;
  modulosIds?: number[];
  permisoLectura?: boolean;
  permisoCreacion?: boolean;
  permisoActualizacion?: boolean;
  permisoBorracion?: boolean;
}

export interface CreateRolModalPayload {
  nombre: string;
  descripcion: string;
  modulosIds: number[];
  permisoLectura: boolean;
  permisoCreacion: boolean;
  permisoActualizacion: boolean;
  permisoBorracion: boolean;
}

export interface CreateRolModalModuloItem {
  idModulo: string;
  nombre: string;
  descripcion: string;
  ruta?: string;
  idModuloPadre?: string | null;
  hijos?: CreateRolModalModuloItem[];
}

@Component({
  selector: 'app-create-rol-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, UiButtonComponent, SkeletonComponent],
  templateUrl: './create-rol-modal.html',
  styleUrl: './create-rol-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRolModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<CreateRolModalMode>('create');
  readonly initialData = input<CreateRolModalInitialData | undefined>();
  readonly isSaving = input(false);
  readonly modulos = input<CreateRolModalModuloItem[]>([]);
  readonly modulesLoading = input(false);

  readonly cancelRequested = output<void>();
  readonly saveRequested = output<CreateRolModalPayload>();

  readonly closeIcon = X;
  readonly expandIcon = ChevronRight;
  readonly collapseIcon = ChevronDown;
  readonly isEditMode = signal(false);
  readonly selectedModuleIds = signal<number[]>([]);
  readonly expandedModuleIds = signal<number[]>([]);

  readonly rolForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    permisoLectura: [true],
    permisoCreacion: [true],
    permisoActualizacion: [true],
    permisoBorracion: [false],
  });

  constructor() {
    effect(() => {
      this.isEditMode.set(this.mode() === 'edit');

      if (this.isEditMode()) {
        const data = this.initialData();
        if (data) {
          this.rolForm.patchValue({
            nombre: data.nombre || '',
            descripcion: data.descripcion || '',
            permisoLectura: data.permisoLectura ?? true,
            permisoCreacion: data.permisoCreacion ?? true,
            permisoActualizacion: data.permisoActualizacion ?? true,
            permisoBorracion: data.permisoBorracion ?? false,
          });
          this.selectedModuleIds.set(data.modulosIds ?? []);
        } else {
          this.selectedModuleIds.set([]);
        }
        this.expandedModuleIds.set([]);
      } else {
        this.rolForm.reset({
          nombre: '',
          descripcion: '',
          permisoLectura: true,
          permisoCreacion: true,
          permisoActualizacion: true,
          permisoBorracion: false,
        });
        this.selectedModuleIds.set([]);
        this.expandedModuleIds.set([]);
      }
    });
  }

  submit(): void {
    if (this.rolForm.invalid || this.selectedModuleIds().length === 0) return;

    this.saveRequested.emit({
      ...this.rolForm.getRawValue(),
      modulosIds: this.selectedModuleIds(),
    });
  }

  isModuleSelected(moduleId: string): boolean {
    const id = Number(moduleId);
    return this.selectedModuleIds().includes(id);
  }

  toggleModule(moduleId: string): void {
    const id = Number(moduleId);

    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    const current = this.selectedModuleIds();
    const exists = current.includes(id);

    if (exists) {
      this.selectedModuleIds.set(current.filter((value) => value !== id));
      return;
    }

    this.selectedModuleIds.set([...current, id]);
  }

  get hasModuleSelection(): boolean {
    return this.selectedModuleIds().length > 0;
  }

  getRootModules(): CreateRolModalModuloItem[] {
    const modules = this.modulos();
    return modules.filter((module) => !module.idModuloPadre);
  }

  getChildModules(parentId: string): CreateRolModalModuloItem[] {
    const parentModule = this.modulos().find((m) => m.idModulo === parentId);
    return parentModule?.hijos ?? [];
  }

  hasChildren(moduleId: string): boolean {
    return this.getChildModules(moduleId).length > 0;
  }

  isExpanded(moduleId: string): boolean {
    const numericId = Number(moduleId);
    return Number.isFinite(numericId) && this.expandedModuleIds().includes(numericId);
  }

  toggleExpand(moduleId: string): void {
    const numericId = Number(moduleId);

    if (!Number.isFinite(numericId)) {
      return;
    }

    const expanded = this.expandedModuleIds();

    if (expanded.includes(numericId)) {
      this.expandedModuleIds.set(expanded.filter((id) => id !== numericId));
      return;
    }

    this.expandedModuleIds.set([...expanded, numericId]);
  }

  cancel(): void {
    this.cancelRequested.emit();
  }
}
