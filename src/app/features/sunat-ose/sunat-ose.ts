import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-sunat-ose',
  imports: [ModulePageComponent],
  templateUrl: './sunat-ose.html',
  styleUrl: './sunat-ose.css',
})
export class SunatOseComponent {
  readonly title = 'SUNAT/OSE';
  readonly subtitle = 'Supervisa envíos, respuestas, CDR y errores.';
  readonly columns: TableColumn[] = [
    { key: 'lote', label: 'Lote' },
    { key: 'respuesta', label: 'Respuesta' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { lote: 'ENV-00098', respuesta: 'CDR aceptado', estado: 'Aceptado' },
    { lote: 'ENV-00099', respuesta: 'En proceso OSE', estado: 'Pendiente' },
  ];
}
