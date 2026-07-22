import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <section class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span class="brand-mark">A</span>
          <div>
            <h2>Adelyss Admin</h2>
            <p>Backoffice Pro</p>
          </div>
        </div>

        <nav class="admin-menu">
          <a routerLink="/admin/quotes" routerLinkActive="active" class="menu-link">
            <i class="icon">✉️</i> Devis
          </a>
          <a routerLink="/admin/events" routerLinkActive="active" class="menu-link">
            <i class="icon">📅</i> Événements
          </a>
          <a routerLink="/admin/team" routerLinkActive="active" class="menu-link">
            <i class="icon">👥</i> Équipe
          </a>
          <a routerLink="/admin/recruitment/offers" routerLinkActive="active" class="menu-link">
            <i class="icon">💼</i> Offres d'emploi
          </a>
          <a routerLink="/admin/recruitment/applications" routerLinkActive="active" class="menu-link">
            <i class="icon">📥</i> Candidatures
          </a>
          <a routerLink="/admin/partners" routerLinkActive="active" class="menu-link">
            <i class="icon">🤝</i> Réseau (Partenaires)
          </a>
          <a routerLink="/admin/messages" routerLinkActive="active" class="menu-link" style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
            <i class="icon">💬</i> Messages reçus
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="icon">🚪</i> Déconnexion
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </section>
  `,
  styles: [
    `
      .admin-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 280px 1fr;
        background: #f4f7fa;
      }

      .admin-sidebar {
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        color: #fff;
        padding: 2rem 1.5rem;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
      }

      .admin-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 1.5rem;
      }

      .brand-mark {
        width: 3rem;
        height: 3rem;
        border-radius: 12px;
        background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%);
        display: grid;
        place-items: center;
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.4rem;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
      }

      .admin-brand h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .admin-brand p {
        margin: 0.2rem 0 0;
        font-size: 0.8rem;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .admin-menu {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
      }

      .menu-link {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.8rem 1rem;
        border-radius: 10px;
        text-decoration: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
      }

      .menu-link:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        transform: translateX(4px);
      }

      .menu-link.active {
        background: rgba(212, 175, 55, 0.15);
        border-color: rgba(212, 175, 55, 0.3);
        color: #d4af37;
        box-shadow: inset 4px 0 0 #d4af37;
      }

      .sidebar-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.8rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
      }

      .admin-main {
        padding: 2.5rem;
        height: 100vh;
        overflow-y: auto;
      }

      @media (max-width: 900px) {
        .admin-shell {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }

        .admin-sidebar {
          padding: 1rem;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-brand {
          padding-bottom: 0;
          border-bottom: 0;
          margin-bottom: 0;
        }

        .admin-menu {
          flex-direction: row;
          align-items: center;
        }

        .sidebar-footer {
          margin-top: 0;
          padding-top: 0;
          border-top: 0;
        }
        
        .admin-main {
          padding: 1.5rem;
        }
      }
    `
  ]
})
export class AdminLayoutComponent {
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
