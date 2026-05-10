import { Component, Input } from '@angular/core';
import { TableColumn } from '../../../core/models/table-column.model';
import { PageTitleComponent } from '../page-title/page-title';
import { UiButtonComponent } from '../ui-button/ui-button';
import { UiCardComponent } from '../ui-card/ui-card';
import { UiTableComponent } from '../ui-table/ui-table';

@Component({
  selector: 'app-module-page',
  imports: [PageTitleComponent, UiButtonComponent, UiCardComponent, UiTableComponent],
  templateUrl: './module-page.html',
  styleUrl: './module-page.css',
})
export class ModulePageComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input() buttonLabel = 'Nuevo';
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, string>[] = [];
}
