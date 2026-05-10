import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-metric-card',
  imports: [LucideAngularModule],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.css',
})
export class MetricCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value = '';
  @Input({ required: true }) icon!: LucideIconData;
  @Input() variant: 'primary' | 'accent' | 'neutral' = 'primary';

  get iconWrapperClass(): string {
    switch (this.variant) {
      case 'accent':
        return 'bg-accent/15 text-accent';
      case 'neutral':
        return 'bg-page text-primary';
      default:
        return 'bg-primary/10 text-primary';
    }
  }
}
