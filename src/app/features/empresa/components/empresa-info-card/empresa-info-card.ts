import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EmpresaResponse } from '../../../../core/models/empresa.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card';

@Component({
  selector: 'app-empresa-info-card',
  standalone: true,
  imports: [UiCardComponent, UiButtonComponent, StatusBadgeComponent],
  templateUrl: './empresa-info-card.html',
  styleUrl: './empresa-info-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaInfoCardComponent {
  readonly empresa = input.required<EmpresaResponse>();
  readonly actionLoading = input(false);

  readonly editRequested = output<void>();
  readonly toggleEstadoRequested = output<void>();

  get estadoLabel(): string {
    return this.empresa().estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
  }
}
