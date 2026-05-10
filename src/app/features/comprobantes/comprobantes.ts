import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-comprobantes',
  imports: [ModulePageComponent],
  templateUrl: './comprobantes.html',
  styleUrl: './comprobantes.css',
})
export class ComprobantesComponent {
  readonly title = 'Comprobantes';
  readonly subtitle = 'Consulta comprobantes electrónicos y estado SUNAT/OSE.';
  readonly columns: TableColumn[] = [
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { comprobante: 'F001-000234', cliente: 'Inversiones Lima S.A.C.', estado: 'Aceptado' },
    { comprobante: 'B001-001044', cliente: 'Distribuidora Norte S.R.L.', estado: 'Pendiente' },
  ];
}
