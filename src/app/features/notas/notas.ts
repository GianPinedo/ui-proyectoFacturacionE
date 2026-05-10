import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-notas',
  imports: [ModulePageComponent],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
})
export class NotasComponent {
  readonly title = 'Notas crédito/débito';
  readonly subtitle = 'Gestiona notas asociadas a comprobantes emitidos.';
  readonly columns: TableColumn[] = [
    { key: 'nota', label: 'Nota' },
    { key: 'comprobante', label: 'Comprobante relacionado' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { nota: 'NC01-000012', comprobante: 'F001-000233', estado: 'Enviado' },
    { nota: 'ND01-000004', comprobante: 'F001-000228', estado: 'Pendiente' },
  ];
}
