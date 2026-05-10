import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-productos-servicios',
  imports: [ModulePageComponent],
  templateUrl: './productos-servicios.html',
  styleUrl: './productos-servicios.css',
})
export class ProductosServiciosComponent {
  readonly title = 'Productos y servicios';
  readonly subtitle = 'Gestiona productos, servicios, precios y afectación IGV.';
  readonly columns: TableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { codigo: 'P-001', descripcion: 'Servicio de consultoría mensual', estado: 'Activo' },
    { codigo: 'P-002', descripcion: 'Licencia plataforma E-Factzy', estado: 'Activo' },
  ];
}
