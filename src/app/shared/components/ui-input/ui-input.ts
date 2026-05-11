import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  imports: [ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  templateUrl: './ui-input.html',
  styleUrl: './ui-input.css',
})
export class UiInputComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) controlName = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' = 'text';
}
