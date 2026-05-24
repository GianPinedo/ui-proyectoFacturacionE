import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, KeyRound, ListTree, Pencil, Trash2, UserCheck, UserX } from 'lucide-angular';
import { TableColumn } from '../../../core/models/table-column.model';
import { StatusBadgeComponent } from '../status-badge/status-badge';

@Component({
  selector: 'app-ui-table',
  imports: [StatusBadgeComponent, LucideAngularModule],
  templateUrl: './ui-table.html',
  styleUrl: './ui-table.css',
})
export class UiTableComponent {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) rows: Record<string, string>[] = [];
  @Input() statusColumnKey = 'estado';
  @Input() actionsColumnKey = 'acciones';
  @Input() showActions = false;
  @Input() emptyLabel = 'Sin datos disponibles';
  @Input() loading = false;
  @Input() skeletonRows = 6;
  @Input() showEditAction = true;
  @Input() showResetPasswordAction = true;
  @Input() showDisableAccessAction = true;
  @Input() showViewModulesAction = false;
  @Input() showDeleteAction = false;
  @Input() deleteActionLabel = 'Eliminar';
  @Input() rowClickable = false;

  @Output() readonly editRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly resetPasswordRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly disableAccessRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly viewModulesRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly deleteRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly rowClicked = new EventEmitter<Record<string, string>>();

  readonly editIcon = Pencil;
  readonly resetPasswordIcon = KeyRound;
  readonly disableAccessIcon = UserX;
  readonly enableAccessIcon = UserCheck;
  readonly viewModulesIcon = ListTree;
  readonly deleteIcon = Trash2;

  get skeletonIndexes(): number[] {
    return Array.from({ length: this.skeletonRows }, (_, index) => index);
  }

  requestEdit(row: Record<string, string>): void {
    this.editRequested.emit(row);
  }

  requestResetPassword(row: Record<string, string>): void {
    this.resetPasswordRequested.emit(row);
  }

  requestDisableAccess(row: Record<string, string>): void {
    this.disableAccessRequested.emit(row);
  }

  requestViewModules(row: Record<string, string>): void {
    this.viewModulesRequested.emit(row);
  }

  requestDelete(row: Record<string, string>): void {
    this.deleteRequested.emit(row);
  }

  onRowClicked(row: Record<string, string>): void {
    if (!this.rowClickable) {
      return;
    }

    this.rowClicked.emit(row);
  }

  isInactive(row: Record<string, string>): boolean {
    return (row[this.statusColumnKey] || '').toUpperCase() === 'INACTIVO';
  }
}
