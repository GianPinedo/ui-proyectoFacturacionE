import { Component } from '@angular/core';
import { TableColumn } from '../../core/models/table-column.model';
import { ModulePageComponent } from '../../shared/components/module-page/module-page';

@Component({
  selector: 'app-usuarios-roles',
  imports: [ModulePageComponent],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css',
})
export class UsuariosRolesComponent {
  readonly title = 'Usuarios y roles';
  readonly subtitle = 'Gestiona usuarios, roles y accesos del sistema.';
  readonly columns: TableColumn[] = [
    { key: 'usuario', label: 'Usuario' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
  ];
  readonly rows = [
    { usuario: 'gpierre', rol: 'Administrador', estado: 'Activo' },
    { usuario: 'ventas01', rol: 'Facturador', estado: 'Activo' },
  ];
}
