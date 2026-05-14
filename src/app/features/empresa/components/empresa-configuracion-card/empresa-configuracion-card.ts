import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EmpresaResponse } from '../../../../core/models/empresa.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card';

@Component({
  selector: 'app-empresa-configuracion-card',
  standalone: true,
  imports: [UiCardComponent, UiButtonComponent, StatusBadgeComponent],
  templateUrl: './empresa-configuracion-card.html',
  styleUrl: './empresa-configuracion-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaConfiguracionCardComponent {
  readonly empresa = input.required<EmpresaResponse>();
  readonly actionLoading = input(false);

  readonly ambienteRequested = output<void>();
  readonly proveedorRequested = output<void>();
  readonly credencialesRequested = output<void>();
  readonly validarEmisionRequested = output<void>();

  get listaLabel(): string {
    return this.empresa().listaParaEmitir ? 'Lista para emitir' : 'Pendiente';
  }
}
