import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { TableColumn } from '../../../core/models/table-column.model';
import { StatusBadgeComponent } from '../status-badge/status-badge';

@Component({
  selector: 'app-ui-table',
  imports: [StatusBadgeComponent],
  templateUrl: './ui-table.html',
  styleUrl: './ui-table.css',
})
export class UiTableComponent {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) rows: Record<string, string>[] = [];
  @Input() statusColumnKey = 'estado';
  @Input() emptyLabel = 'Sin datos disponibles';
  @Input() loading = false;
  @Input() skeletonRows = 6;

  get skeletonIndexes(): number[] {
    return Array.from({ length: this.skeletonRows }, (_, index) => index);
  }
}
