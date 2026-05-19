import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EmpresaResponse, EmpresaValidacionEmisionResponse } from '../../../../core/models/empresa.model';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card';

@Component({
  selector: 'app-empresa-validacion-panel',
  standalone: true,
  imports: [UiCardComponent],
  templateUrl: './empresa-validacion-panel.html',
  styleUrl: './empresa-validacion-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaValidacionPanelComponent {
  readonly empresa = input.required<EmpresaResponse>();
  readonly validacion = input<EmpresaValidacionEmisionResponse | null>(null);
  readonly loading = input(false);

  readonly isReady = computed(() => {
    const validacion = this.validacion();
    if (validacion) {
      return validacion.listaParaEmitir;
    }

    return this.empresa().listaParaEmitir;
  });

  readonly pendientes = computed(() => this.validacion()?.pendientes ?? []);
}
