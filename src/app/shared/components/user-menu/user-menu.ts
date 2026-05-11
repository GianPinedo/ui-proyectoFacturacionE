import { Component, inject } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { HostListener } from '@angular/core';
import { Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronDown, Settings, User, LogOut } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  imports: [LucideAngularModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.css',
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);

  readonly chevronDownIcon = ChevronDown;
  readonly userIcon = User;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;

  @Output() logoutRequested = new EventEmitter<void>();
  @Output() profileRequested = new EventEmitter<void>();
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

  onProfile(): void {
    this.profileRequested.emit();
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

  get avatarInitials(): string {
    return this.authService.getAvatarInitials();
  }

  get displayName(): string {
    return this.authService.getDisplayName();
  }

  get roleLabel(): string {
    return this.authService.getRoleLabel();
  }
}
