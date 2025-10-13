import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Output event pour le toggle de la sidebar
  toggleSidebar = output<void>();
  
  // Signal pour le menu utilisateur (dropdown)
  userMenuOpen = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  navigateToProfile(): void {
    this.closeUserMenu();
    // TODO: Implémenter la page profil
    console.log('Navigate to profile');
  }

  navigateToSettings(): void {
    this.closeUserMenu();
    // TODO: Implémenter la page paramètres
    console.log('Navigate to settings');
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  // Obtient les initiales de l'utilisateur
  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    
    return (firstInitial + lastInitial).toUpperCase();
  }

  // Obtient le nom complet de l'utilisateur
  getUserFullName(): string {
    const user = this.authService.currentUser();
    if (!user) return 'Invité';
    
    return `${user.firstName} ${user.lastName}`;
  }
}