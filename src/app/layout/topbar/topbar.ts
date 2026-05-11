import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LucideAngularModule, Menu } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu';

@Component({
  selector: 'app-topbar',
  imports: [UserMenuComponent, LucideAngularModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  @Output() readonly menuRequested = new EventEmitter<void>();
  readonly menuIcon = Menu;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  openMenu(): void {
    this.menuRequested.emit();
  }

  openProfile(): void {
    this.router.navigateByUrl('/mi-perfil');
  }

  async logout(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00AD8F',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
      background: '#FFFFFF',
      color: '#003B34',
    });

    if (!result.isConfirmed) {
      return;
    }

    this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
