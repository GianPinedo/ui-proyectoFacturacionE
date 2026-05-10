import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-empresa',
  imports: [ModulePageComponent],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent {
  readonly title = 'Empresa';
  readonly subtitle = 'Configura los datos tributarios y la emisión electrónica.';
  readonly columns: TableColumn[] = [
    { key: 'codigo', label: 'RUC' },
    { key: 'nombre', label: 'Razón social' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [{ codigo: '20111111111', nombre: 'E-Factzy Perú S.A.C.', estado: 'Activo' }];
}
