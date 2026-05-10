import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-correo',
  imports: [ModulePageComponent],
  templateUrl: './correo.html',
  styleUrl: './correo.css',
})
export class CorreoComponent {
  readonly title = 'Correo';
  readonly subtitle = 'Administra el envío de comprobantes por email.';
  readonly columns: TableColumn[] = [
    { key: 'destinatario', label: 'Destinatario' },
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { destinatario: 'contabilidad@cliente.pe', comprobante: 'F001-000234', estado: 'Enviado' },
    { destinatario: 'admin@cliente.pe', comprobante: 'B001-001044', estado: 'Pendiente' },
  ];
}
