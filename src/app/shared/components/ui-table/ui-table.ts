import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Pencil, Trash2, UserX } from 'lucide-angular';
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

  @Output() readonly editRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly deleteRequested = new EventEmitter<Record<string, string>>();
  @Output() readonly disableAccessRequested = new EventEmitter<Record<string, string>>();

  readonly editIcon = Pencil;
  readonly deleteIcon = Trash2;
  readonly disableAccessIcon = UserX;

  get skeletonIndexes(): number[] {
    return Array.from({ length: this.skeletonRows }, (_, index) => index);
  }

  requestEdit(row: Record<string, string>): void {
    this.editRequested.emit(row);
  }

  requestDelete(row: Record<string, string>): void {
    this.deleteRequested.emit(row);
  }

  requestDisableAccess(row: Record<string, string>): void {
    this.disableAccessRequested.emit(row);
  }
}
