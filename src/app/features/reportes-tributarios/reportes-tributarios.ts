import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-reportes-tributarios',
  imports: [ModulePageComponent],
  templateUrl: './reportes-tributarios.html',
  styleUrl: './reportes-tributarios.css',
})
export class ReportesTributariosComponent {
  readonly title = 'Reportes tributarios';
  readonly subtitle = 'Consulta resumen tributario básico para control interno.';
  readonly columns: TableColumn[] = [
    { key: 'periodo', label: 'Período' },
    { key: 'igv', label: 'IGV' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { periodo: 'Mayo 2026', igv: 'S/ 8,681.49', estado: 'Activo' },
    { periodo: 'Abril 2026', igv: 'S/ 7,399.85', estado: 'Activo' },
  ];
}
