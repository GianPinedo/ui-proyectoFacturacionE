import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-page-title',
  imports: [],
  templateUrl: './page-title.html',
  styleUrl: './page-title.css',
})
export class PageTitleComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
}
