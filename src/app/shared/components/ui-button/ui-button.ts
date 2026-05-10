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
  @Input() variant: 'primary' | 'secondary' | 'accent-strong' | 'login' = 'primary';
}
