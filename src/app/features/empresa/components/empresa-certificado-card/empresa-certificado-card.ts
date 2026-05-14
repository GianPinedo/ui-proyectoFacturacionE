import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CertificadoValidacionResponse, EmpresaResponse } from '../../../../core/models/empresa.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card';

@Component({
  selector: 'app-empresa-certificado-card',
  standalone: true,
  imports: [UiCardComponent, UiButtonComponent, StatusBadgeComponent],
  templateUrl: './empresa-certificado-card.html',
  styleUrl: './empresa-certificado-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaCertificadoCardComponent {
  readonly empresa = input.required<EmpresaResponse>();
  readonly validacion = input<CertificadoValidacionResponse | null>(null);
  readonly actionLoading = input(false);

  readonly cargarRequested = output<void>();
  readonly validarRequested = output<void>();

  get statusLabel(): string {
    const result = this.validacion();

    if (!this.empresa().tieneCertificado) {
      return 'No cargado';
    }

    if (!result) {
      return 'Pendiente';
    }

    return result.valido ? 'Válido' : 'Inválido';
  }
}
