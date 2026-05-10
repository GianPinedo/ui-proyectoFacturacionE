import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-series-correlativos',
  imports: [ModulePageComponent],
  templateUrl: './series-correlativos.html',
  styleUrl: './series-correlativos.css',
})
export class SeriesCorrelativosComponent {
  readonly title = 'Series y correlativos';
  readonly subtitle = 'Controla la numeración de comprobantes electrónicos.';
  readonly columns: TableColumn[] = [
    { key: 'serie', label: 'Serie' },
    { key: 'tipo', label: 'Tipo de comprobante' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { serie: 'F001', tipo: 'Factura', estado: 'Activo' },
    { serie: 'B001', tipo: 'Boleta', estado: 'Activo' },
  ];
}
