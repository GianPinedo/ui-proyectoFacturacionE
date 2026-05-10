import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-auditoria',
  imports: [ModulePageComponent],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  readonly title = 'Auditoría';
  readonly subtitle = 'Revisa la trazabilidad de operaciones críticas.';
  readonly columns: TableColumn[] = [
    { key: 'evento', label: 'Evento' },
    { key: 'usuario', label: 'Usuario' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { evento: 'Emisión comprobante F001-000234', usuario: 'gpierre', estado: 'Activo' },
    { evento: 'Actualización de serie B001', usuario: 'admin', estado: 'Activo' },
  ];
}
