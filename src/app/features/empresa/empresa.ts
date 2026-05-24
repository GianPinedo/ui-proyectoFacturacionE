import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Building2 } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AppMessages } from '../../core/constants/app-messages';
import {
  CertificadoValidacionResponse,
  EmpresaAmbienteEmision,
  EmpresaCreateRequest,
  EmpresaCredencialesRequest,
  EmpresaEstado,
  EmpresaResponse,
  EmpresaUpdateRequest,
  EmpresaValidacionEmisionResponse,
} from '../../core/models/empresa.model';
import { EmpresasService } from '../../core/services/empresas.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { PageTitleComponent } from '../../shared/components/page-title/page-title';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card';
import {
  EmpresaFormModalComponent,
  EmpresaFormModalData,
  EmpresaFormModalMode,
  EmpresaFormModalSubmitPayload,
} from './components/empresa-form-modal/empresa-form-modal';
import { EmpresaCredencialesModalComponent } from './components/empresa-credenciales-modal/empresa-credenciales-modal';
import {
  EmpresaCertificadoModalComponent,
  EmpresaCertificadoSubmitPayload,
} from './components/empresa-certificado-modal/empresa-certificado-modal';
import { EmpresaInfoCardComponent } from './components/empresa-info-card/empresa-info-card';
import { EmpresaConfiguracionCardComponent } from './components/empresa-configuracion-card/empresa-configuracion-card';
import { EmpresaCertificadoCardComponent } from './components/empresa-certificado-card/empresa-certificado-card';
import { EmpresaLogoCardComponent } from './components/empresa-logo-card/empresa-logo-card';
import { EmpresaValidacionPanelComponent } from './components/empresa-validacion-panel/empresa-validacion-panel';

@Component({
  selector: 'app-empresa',
  imports: [
    LucideAngularModule,
    PageTitleComponent,
    UiButtonComponent,
    UiCardComponent,
    SkeletonComponent,
    EmpresaFormModalComponent,
    EmpresaCredencialesModalComponent,
    EmpresaCertificadoModalComponent,
    EmpresaInfoCardComponent,
    EmpresaConfiguracionCardComponent,
    EmpresaCertificadoCardComponent,
    EmpresaLogoCardComponent,
    EmpresaValidacionPanelComponent,
  ],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit {
  private readonly empresasService = inject(EmpresasService);

  @ViewChild(EmpresaLogoCardComponent) logoCardComponent?: EmpresaLogoCardComponent;

  readonly title = 'Empresa';
  readonly subtitle = 'Configura los datos tributarios y la emisión electrónica.';
  readonly buildingIcon = Building2;

  readonly empresa = signal<EmpresaResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly validacion = signal<EmpresaValidacionEmisionResponse | null>(null);
  readonly validacionLoading = signal(false);
  readonly certificadoValidacion = signal<CertificadoValidacionResponse | null>(null);

  readonly empresaModalOpen = signal(false);
  readonly credencialesModalOpen = signal(false);
  readonly certificadoModalOpen = signal(false);

  readonly empresaModalMode = signal<EmpresaFormModalMode>('create');
  readonly empresaModalInitialData = signal<EmpresaFormModalData | null>(null);

  readonly empresaSaving = signal(false);
  readonly credencialesSaving = signal(false);
  readonly certificadoSaving = signal(false);
  readonly actionLoading = signal(false);

  readonly hasEmpresa = computed(() => !!this.empresa());

  ngOnInit(): void {
    this.loadEmpresaPrincipal();
  }

  openEmpresaModal(): void {
    this.empresaModalMode.set(this.empresa() ? 'edit' : 'create');
    this.empresaModalInitialData.set(this.toModalData(this.empresa()));
    this.empresaModalOpen.set(true);
  }

  closeEmpresaModal(): void {
    this.empresaModalOpen.set(false);
    this.empresaModalInitialData.set(null);
  }

  openCredencialesModal(): void {
    this.credencialesModalOpen.set(true);
  }

  closeCredencialesModal(): void {
    this.credencialesModalOpen.set(false);
  }

  openCertificadoModal(): void {
    this.certificadoModalOpen.set(true);
  }

  closeCertificadoModal(): void {
    this.certificadoModalOpen.set(false);
  }

  submitEmpresa(payload: EmpresaFormModalSubmitPayload): void {
    const current = this.empresa();

    if (!current) {
      this.createEmpresa(payload.createRequest);
      return;
    }

    this.updateEmpresa(current.idEmpresa, payload.updateRequest);
  }

  submitCredenciales(request: EmpresaCredencialesRequest): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    this.credencialesSaving.set(true);

    this.empresasService.updateCredenciales(current.idEmpresa, request).subscribe({
      next: () => {
        this.credencialesSaving.set(false);
        this.closeCredencialesModal();
        this.showSuccess('Credenciales registradas', 'Las credenciales de emisión fueron guardadas.');
        this.refreshEmpresa();
      },
      error: (error: unknown) => {
        this.credencialesSaving.set(false);
        this.showError('Error al registrar credenciales', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
      },
    });
  }

  submitCertificado(payload: EmpresaCertificadoSubmitPayload): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    this.certificadoSaving.set(true);

    this.empresasService
      .uploadCertificado(current.idEmpresa, payload.file, payload.clave, payload.confirmacionClave)
      .subscribe({
        next: () => {
          this.certificadoSaving.set(false);
          this.closeCertificadoModal();
          this.showSuccess('Certificado cargado', 'El certificado digital fue cargado correctamente.');
          this.refreshEmpresa();
        },
        error: (error: unknown) => {
          this.certificadoSaving.set(false);
          this.showError('Error al cargar certificado', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
        },
      });
  }

  onToggleEstadoRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    const isActive = current.estado === 'ACTIVO';
    const nextEstado: EmpresaEstado = isActive ? 'INACTIVO' : 'ACTIVO';

    void Swal.fire({
      icon: 'warning',
      title: isActive ? 'Desactivar empresa' : 'Activar empresa',
      text: isActive ? 'La empresa dejará de emitir comprobantes.' : 'La empresa volverá a estar operativa.',
      showCancelButton: true,
      confirmButtonText: isActive ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      preConfirm: () => {
        return new Promise<void>((resolve, reject) => {
          this.empresasService
            .changeEstado(current.idEmpresa, {
              estado: nextEstado,
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
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.showSuccess('Estado actualizado', isActive ? 'La empresa fue desactivada.' : 'La empresa fue activada.');
      this.refreshEmpresa();
    });
  }

  onConfigurarAmbienteRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    void Swal.fire({
      title: 'Configurar ambiente de emisión',
      input: 'select',
      inputOptions: {
        BETA: 'BETA',
        PRODUCCION: 'PRODUCCIÓN',
      },
      inputValue: current.ambienteEmision,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
    }).then((result) => {
      if (!result.isConfirmed || !result.value) {
        return;
      }

      const nextAmbiente = String(result.value) as EmpresaAmbienteEmision;

      if (nextAmbiente === 'PRODUCCION' && (!current.tieneCertificado || !current.tieneCredenciales)) {
        void Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Para PRODUCCIÓN se recomienda tener certificado y credenciales registradas.',
          showCancelButton: true,
          confirmButtonText: 'Continuar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#00AD8F',
          cancelButtonColor: '#6B7280',
        }).then((confirmResult) => {
          if (!confirmResult.isConfirmed) {
            return;
          }

          this.updateAmbiente(current.idEmpresa, nextAmbiente);
        });
        return;
      }

      this.updateAmbiente(current.idEmpresa, nextAmbiente);
    });
  }

  onConfigurarProveedorRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    void Swal.fire({
      title: 'Configurar proveedor de emisión',
      input: 'select',
      inputOptions: {
        SUNAT: 'SUNAT',
        OSE: 'OSE',
      },
      inputValue: current.proveedorEmision,
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
    }).then((result) => {
      if (!result.isConfirmed || !result.value) {
        return;
      }

      const proveedor = String(result.value) as 'SUNAT' | 'OSE';

      if (proveedor === 'OSE') {
        void Swal.fire({
          title: 'Endpoint de envío OSE',
          input: 'text',
          inputValue: current.endpointEnvio || '',
          inputPlaceholder: 'https://ose.ejemplo.com/api/envio',
          inputValidator: (value) => {
            if (!value?.trim()) {
              return 'El endpoint es obligatorio para OSE.';
            }

            return null;
          },
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#00AD8F',
          cancelButtonColor: '#6B7280',
        }).then((endpointResult) => {
          if (!endpointResult.isConfirmed) {
            return;
          }

          this.updateProveedor(current.idEmpresa, proveedor, String(endpointResult.value ?? '').trim());
        });
        return;
      }

      this.updateProveedor(current.idEmpresa, proveedor, current.endpointEnvio);
    });
  }

  onUploadLogoRequested(file: File): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.showError('Archivo inválido', 'Solo se permiten archivos PNG, JPG, JPEG o WEBP.');
      return;
    }

    if (file.size > maxSize) {
      this.showError('Archivo demasiado grande', 'El logo no debe superar 2 MB.');
      return;
    }

    this.actionLoading.set(true);
    this.empresasService.uploadLogo(current.idEmpresa, file).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.logoCardComponent?.clearPreview();
        this.showSuccess('Logo actualizado', 'El logo de la empresa fue cargado correctamente.');
        this.refreshEmpresa();
      },
      error: (error: unknown) => {
        this.actionLoading.set(false);
        this.showError('Error al cargar logo', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
      },
    });
  }

  onDeleteLogoRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Eliminar logo',
      text: 'Se eliminará el logo actual de la empresa.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.actionLoading.set(true);
      this.empresasService.deleteLogo(current.idEmpresa).subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.showSuccess('Logo eliminado', 'El logo fue eliminado correctamente.');
          this.refreshEmpresa();
        },
        error: (error: unknown) => {
          this.actionLoading.set(false);
          this.showError('Error al eliminar logo', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
        },
      });
    });
  }

  onValidarCertificadoRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    this.actionLoading.set(true);
    this.empresasService.validarCertificado(current.idEmpresa).subscribe({
      next: (result) => {
        this.actionLoading.set(false);
        this.certificadoValidacion.set(result);

        void Swal.fire({
          icon: result.valido ? 'success' : 'warning',
          title: result.valido ? 'Certificado válido' : 'Certificado inválido',
          text: result.mensaje,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });
      },
      error: (error: unknown) => {
        this.actionLoading.set(false);
        this.showError('Error al validar certificado', this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR);
      },
    });
  }

  onValidarEmisionRequested(): void {
    const current = this.empresa();
    if (!current) {
      return;
    }

    this.validacionLoading.set(true);
    this.empresasService.validarEmision(current.idEmpresa).subscribe({
      next: (result) => {
        this.validacionLoading.set(false);
        this.validacion.set(result);
        this.empresa.update((value) => {
          if (!value) {
            return value;
          }

          return {
            ...value,
            listaParaEmitir: result.listaParaEmitir,
          };
        });

        void Swal.fire({
          icon: result.listaParaEmitir ? 'success' : 'warning',
          title: result.listaParaEmitir ? 'Empresa lista para emitir' : 'Configuración incompleta',
          text: result.listaParaEmitir
            ? 'La empresa cuenta con lo necesario para emitir comprobantes.'
            : 'Aún hay pendientes por completar.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00AD8F',
        });
      },
      error: (error: unknown) => {
        this.validacionLoading.set(false);
        this.showError('Error al validar emisión', this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR);
      },
    });
  }

  retryLoad(): void {
    this.loadEmpresaPrincipal();
  }

  private createEmpresa(request: EmpresaCreateRequest): void {
    this.empresaSaving.set(true);

    this.empresasService.create(request).subscribe({
      next: () => {
        this.empresaSaving.set(false);
        this.closeEmpresaModal();
        this.showSuccess('Empresa registrada', 'La empresa fue registrada correctamente.');
        this.loadEmpresaPrincipal();
      },
      error: (error: unknown) => {
        this.empresaSaving.set(false);
        this.showError('Error al registrar empresa', this.extractErrorMessage(error) || AppMessages.GENERIC_SAVE_ERROR);
      },
    });
  }

  private updateEmpresa(idEmpresa: number, request: EmpresaUpdateRequest): void {
    this.empresaSaving.set(true);

    this.empresasService.update(idEmpresa, request).subscribe({
      next: () => {
        this.empresaSaving.set(false);
        this.closeEmpresaModal();
        this.showSuccess('Empresa actualizada', 'Los cambios de la empresa fueron guardados.');
        this.refreshEmpresa();
      },
      error: (error: unknown) => {
        this.empresaSaving.set(false);
        this.showError('Error al actualizar empresa', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
      },
    });
  }

  private updateAmbiente(idEmpresa: number, ambiente: EmpresaAmbienteEmision): void {
    this.actionLoading.set(true);

    this.empresasService.updateAmbiente(idEmpresa, { ambienteEmision: ambiente }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showSuccess('Ambiente actualizado', 'El ambiente de emisión fue actualizado.');
        this.refreshEmpresa();
      },
      error: (error: unknown) => {
        this.actionLoading.set(false);
        this.showError('Error al actualizar ambiente', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
      },
    });
  }

  private updateProveedor(idEmpresa: number, proveedor: 'SUNAT' | 'OSE', endpointEnvio?: string): void {
    this.actionLoading.set(true);

    this.empresasService.updateProveedor(idEmpresa, { proveedorEmision: proveedor, endpointEnvio }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showSuccess('Proveedor actualizado', 'La configuración de proveedor fue actualizada.');
        this.refreshEmpresa();
      },
      error: (error: unknown) => {
        this.actionLoading.set(false);
        this.showError('Error al actualizar proveedor', this.extractErrorMessage(error) || AppMessages.GENERIC_UPDATE_ERROR);
      },
    });
  }

  private refreshEmpresa(): void {
    this.loadEmpresaPrincipal(false);
  }

  private loadEmpresaPrincipal(showLoading = true): void {
    if (showLoading) {
      this.loading.set(true);
    }

    this.error.set(null);

    this.empresasService.getEmpresaPrincipal().subscribe({
      next: (empresa) => {
        this.empresa.set(empresa);
        this.error.set(null);
        this.loadValidacion(empresa.idEmpresa);

        if (showLoading) {
          this.loading.set(false);
        }
      },
      error: (error: unknown) => {
        if (showLoading) {
          this.loading.set(false);
        }

        const status = error instanceof HttpErrorResponse ? error.status : undefined;

        if (status === 404) {
          this.empresa.set(null);
          this.validacion.set(null);
          this.error.set(null);
          return;
        }

        this.empresa.set(null);
        this.validacion.set(null);
        this.error.set(this.extractErrorMessage(error) || AppMessages.GENERIC_LOAD_ERROR);
      },
    });
  }

  private loadValidacion(idEmpresa: number): void {
    this.validacionLoading.set(true);

    this.empresasService.validarEmision(idEmpresa).subscribe({
      next: (result) => {
        this.validacionLoading.set(false);
        this.validacion.set(result);
      },
      error: () => {
        this.validacionLoading.set(false);
        this.validacion.set(null);
      },
    });
  }

  private toModalData(empresa: EmpresaResponse | null): EmpresaFormModalData | null {
    if (!empresa) {
      return null;
    }

    return {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      nombreComercial: empresa.nombreComercial,
      direccion: empresa.direccion,
      ubigeo: empresa.ubigeo,
      departamento: empresa.departamento,
      provincia: empresa.provincia,
      distrito: empresa.distrito,
      correo: empresa.correo,
      telefono: empresa.telefono,
    };
  }

  private showSuccess(title: string, text: string): void {
    void Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00AD8F',
    });
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
        const message = (payload as { message?: unknown; errors?: unknown }).message;

        if (typeof message === 'string') {
          return message;
        }

        if (Array.isArray(message)) {
          return message.join(' ');
        }

        const errors = (payload as { errors?: unknown }).errors;
        if (Array.isArray(errors)) {
          return errors.filter((item) => typeof item === 'string').join(' ');
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

