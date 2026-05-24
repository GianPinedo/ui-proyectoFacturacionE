import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-title',
  imports: [RouterLink],
  templateUrl: './page-title.html',
  styleUrl: './page-title.css',
})
export class PageTitleComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';

  get showCurrentBreadcrumb(): boolean {
    return this.title.trim().toLowerCase() !== 'inicio';
  }
}
