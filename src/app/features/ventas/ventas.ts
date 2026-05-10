import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-ventas',
  imports: [ModulePageComponent],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class VentasComponent {
  readonly title = 'Ventas';
  readonly subtitle = 'Registra operaciones comerciales y prepara comprobantes.';
  readonly columns: TableColumn[] = [
    { key: 'operacion', label: 'Operación' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { operacion: 'OV-00124', cliente: 'Inversiones Lima S.A.C.', estado: 'Pendiente' },
    { operacion: 'OV-00123', cliente: 'Comercial Oriente del Perú S.A.C.', estado: 'Activo' },
  ];
}
