import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent, TopbarComponent, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent {
  private readonly bootstrapStartedAt = Date.now();
  private readonly minimumBootstrapMs = 1000;
  private bootstrapCompleted = false;

  isSidebarOpen = false;
  isSidebarCollapsed = false;
  isBootstrapping = true;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onSidebarCollapsedChanged(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  onSidebarMenuReady(): void {
    if (this.bootstrapCompleted) {
      return;
    }

    this.bootstrapCompleted = true;

    const elapsedMs = Date.now() - this.bootstrapStartedAt;
    const remainingMs = Math.max(0, this.minimumBootstrapMs - elapsedMs);

    window.setTimeout(() => {
      this.isBootstrapping = false;
    }, remainingMs);
  }
}
