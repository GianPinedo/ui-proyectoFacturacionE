import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-reportes-ventas',
  imports: [ModulePageComponent],
  templateUrl: './reportes-ventas.html',
  styleUrl: './reportes-ventas.css',
})
export class ReportesVentasComponent {
  readonly title = 'Reportes ventas';
  readonly subtitle = 'Analiza ventas por fecha, cliente, comprobante y estado.';
  readonly columns: TableColumn[] = [
    { key: 'periodo', label: 'Período' },
    { key: 'total', label: 'Total ventas' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { periodo: 'Mayo 2026', total: 'S/ 48,230.50', estado: 'Activo' },
    { periodo: 'Abril 2026', total: 'S/ 41,110.30', estado: 'Activo' },
  ];
}
