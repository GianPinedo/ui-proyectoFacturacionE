import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get classes(): string {
    const normalized = this.status.trim().toLowerCase();

    if (normalized.includes('inactivo')) {
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    }

    if (normalized.includes('aceptado') || /\bactivo\b/.test(normalized) || normalized.includes('enviado')) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    }

    if (normalized.includes('pendiente')) {
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    }

    if (normalized.includes('rechazado')) {
      return 'bg-rose-50 text-rose-700 border border-rose-100';
    }

    return 'bg-page text-primary border border-border';
  }
}
