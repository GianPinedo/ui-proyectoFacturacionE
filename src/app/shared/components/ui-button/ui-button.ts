import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  imports: [],
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.css',
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' = 'primary';

  get classes(): string {
    const base =
      'inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60';
    const tone =
      this.variant === 'primary'
        ? 'bg-accent text-white hover:bg-accent/90'
        : 'border border-border bg-white text-primary hover:bg-page';
    const width = this.fullWidth ? 'w-full' : '';
    return `${base} ${tone} ${width}`.trim();
  }
}
