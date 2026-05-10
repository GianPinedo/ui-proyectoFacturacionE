import { Component } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { HostListener } from '@angular/core';
import { Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronDown, Settings, User, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-user-menu',
  imports: [LucideAngularModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.css',
})
export class UserMenuComponent {
  readonly chevronDownIcon = ChevronDown;
  readonly userIcon = User;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;

  @Output() logoutRequested = new EventEmitter<void>();
  isOpen = false;

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  onLogout(): void {
    this.logoutRequested.emit();
    this.closeMenu();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }

  onTriggerClick(event: Event): void {
    event.stopPropagation();
    this.toggleMenu();
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
  }
}
