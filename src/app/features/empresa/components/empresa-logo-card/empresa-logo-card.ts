import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { EmpresaResponse } from '../../../../core/models/empresa.model';
import { UiButtonComponent } from '../../../../shared/components/ui-button/ui-button';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card';

@Component({
  selector: 'app-empresa-logo-card',
  standalone: true,
  imports: [UiCardComponent, UiButtonComponent],
  templateUrl: './empresa-logo-card.html',
  styleUrl: './empresa-logo-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaLogoCardComponent {
  readonly empresa = input.required<EmpresaResponse>();
  readonly actionLoading = input(false);

  readonly uploadRequested = output<File>();
  readonly deleteRequested = output<void>();

  readonly previewUrl = signal<string | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Crear vista previa en memoria
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Emitir el archivo para que el componente padre lo procese
    this.uploadRequested.emit(file);
    input.value = '';
  }

  clearPreview(): void {
    this.previewUrl.set(null);
  }
}

