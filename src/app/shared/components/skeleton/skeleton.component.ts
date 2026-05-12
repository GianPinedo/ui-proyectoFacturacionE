import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div
    class="animate-pulse rounded-xl"
    [class.h-11]="height() === 'sm'"
    [class.h-12]="height() === 'md'"
    [class.h-24]="height() === 'lg'"
    [class.bg-slate-200]="!dark()"
    [class.bg-slate-700]="dark()"
  ></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly height = input<'sm' | 'md' | 'lg'>('md');
  readonly dark = input(false);
}
