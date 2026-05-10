import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-catalogos-sunat',
  imports: [ModulePageComponent],
  templateUrl: './catalogos-sunat.html',
  styleUrl: './catalogos-sunat.css',
})
export class CatalogosSunatComponent {
  readonly title = 'Catálogos SUNAT';
  readonly subtitle = 'Administra catálogos tributarios básicos del sistema.';
  readonly columns: TableColumn[] = [
    { key: 'catalogo', label: 'Catálogo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { catalogo: 'Tipo de documento', descripcion: 'Facturas y boletas', estado: 'Activo' },
    { catalogo: 'Tipo de afectación IGV', descripcion: 'Operaciones gravadas', estado: 'Activo' },
  ];
}
