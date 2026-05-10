import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-clientes',
  imports: [ModulePageComponent],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class ClientesComponent {
  readonly title = 'Clientes';
  readonly subtitle = 'Administra los clientes para la emisión de comprobantes.';
  readonly columns: TableColumn[] = [
    { key: 'documento', label: 'Documento' },
    { key: 'razonSocial', label: 'Razón social' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { documento: '20607894561', razonSocial: 'Inversiones Lima S.A.C.', estado: 'Activo' },
    { documento: '20549876543', razonSocial: 'Distribuidora Norte S.R.L.', estado: 'Activo' },
  ];
}
