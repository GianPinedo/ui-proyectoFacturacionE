import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-angular';
import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-ui-pagination',
  imports: [LucideAngularModule, UiButtonComponent],
  templateUrl: './ui-pagination.html',
  styleUrl: './ui-pagination.css',
})
export class UiPaginationComponent {
  @Input({ required: true }) page = 0;
  @Input({ required: true }) totalPages = 0;
  @Input({ required: true }) total = 0;
  @Input({ required: true }) pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() loading = false;

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();

  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly moreHorizontalIcon = MoreHorizontal;

  get visiblePageNumbers(): number[] {
    if (this.totalPages <= 3) {
      return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    }

    const current = this.page + 1;

    if (current <= 2) {
      return [1, 2, 3];
    }

    if (current >= this.totalPages - 1) {
      return [this.totalPages - 2, this.totalPages - 1, this.totalPages];
    }

    return [current - 1, current, current + 1];
  }

  get showLeftEllipsis(): boolean {
    return this.totalPages > 3 && this.visiblePageNumbers[0] > 1;
  }

  get showRightEllipsis(): boolean {
    const pages = this.visiblePageNumbers;
    return this.totalPages > 3 && pages[pages.length - 1] < this.totalPages;
  }

  goToPage(pageNumber: number): void {
    const targetIndex = pageNumber - 1;

    if (this.loading || targetIndex < 0 || targetIndex >= this.totalPages || targetIndex === this.page) {
      return;
    }

    this.pageChange.emit(targetIndex);
  }

  previousPage(): void {
    if (this.loading || this.page <= 0) {
      return;
    }

    this.pageChange.emit(this.page - 1);
  }

  nextPage(): void {
    if (this.loading || this.page + 1 >= this.totalPages) {
      return;
    }

    this.pageChange.emit(this.page + 1);
  }

  onPageSizeChange(value: string): void {
    const size = Number(value);

    if (!Number.isFinite(size) || size <= 0 || size === this.pageSize) {
      return;
    }

    this.pageSizeChange.emit(size);
  }
}
