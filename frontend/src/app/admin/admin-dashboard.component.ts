import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminQuotesService, AdminQuote } from './admin-quotes.service';
import { AdminRecruitmentService, JobApplication } from './admin-recruitment.service';
import { AdminMessageService, ContactMessage } from './admin-message.service';
import { AdminEventService, AdminEvent } from './admin-event.service';
import { AdminServiceOfferService, ServiceOffer } from './admin-service-offer.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-shell">
      <div class="page-header">
        <div>
          <p class="overline">Vue d'ensemble &amp; Performance</p>
          <h1>📊 Tableau de bord général</h1>
        </div>
        <div class="date-badge">
          📅 {{ today | date: 'fullDate' }}
        </div>
      </div>

      <!-- Cartes KPIs Majeurs -->
      <div class="kpi-grid">
        <article class="kpi-card highlight" routerLink="/admin/quotes">
          <div class="kpi-top">
            <span class="kpi-icon">✉️</span>
            <span class="badge" [class.badge-alert]="newQuotesCount > 0">{{ newQuotesCount }} en attente</span>
          </div>
          <div class="kpi-body">
            <h3>Demandes de Devis</h3>
            <p class="kpi-number">{{ quotes.length }}</p>
            <span class="kpi-meta">{{ repliedQuotesCount }} devis traités &amp; répondus</span>
          </div>
          <div class="kpi-arrow">→ Accéder aux devis</div>
        </article>

        <article class="kpi-card" routerLink="/admin/recruitment/applications">
          <div class="kpi-top">
            <span class="kpi-icon">📥</span>
            <span class="badge" [class.badge-alert]="newAppsCount > 0">{{ newAppsCount }} nouvelles</span>
          </div>
          <div class="kpi-body">
            <h3>Candidatures &amp; CV</h3>
            <p class="kpi-number">{{ applications.length }}</p>
            <span class="kpi-meta">{{ acceptedAppsCount }} profils retenus ⭐</span>
          </div>
          <div class="kpi-arrow">→ Accéder aux candidatures</div>
        </article>

        <article class="kpi-card" routerLink="/admin/messages">
          <div class="kpi-top">
            <span class="kpi-icon">💬</span>
            <span class="badge" [class.badge-alert]="newMessagesCount > 0">{{ newMessagesCount }} non lus</span>
          </div>
          <div class="kpi-body">
            <h3>Messages de Contact</h3>
            <p class="kpi-number">{{ messages.length }}</p>
            <span class="kpi-meta">Boîte de réception générale</span>
          </div>
          <div class="kpi-arrow">→ Accéder aux messages</div>
        </article>

        <article class="kpi-card" routerLink="/admin/events">
          <div class="kpi-top">
            <span class="kpi-icon">📅</span>
            <span class="badge">{{ events.length }} publiés</span>
          </div>
          <div class="kpi-body">
            <h3>Portfolio Événements</h3>
            <p class="kpi-number">{{ events.length }}</p>
            <span class="kpi-meta">Photos &amp; vidéos en ligne</span>
          </div>
          <div class="kpi-arrow">→ Gérer les événements</div>
        </article>

        <article class="kpi-card" routerLink="/admin/clients">
          <div class="kpi-top">
            <span class="kpi-icon">⭐</span>
            <span class="badge badge-success">{{ clientCount }} logos</span>
          </div>
          <div class="kpi-body">
            <h3>Ils nous font confiance</h3>
            <p class="kpi-number">{{ clientCount }}</p>
            <span class="kpi-meta">Références B2B &amp; Partenaires</span>
          </div>
          <div class="kpi-arrow">→ Gérer les logos clients</div>
        </article>

        <article class="kpi-card" routerLink="/admin/services">
          <div class="kpi-top">
            <span class="kpi-icon">🛎️</span>
            <span class="badge badge-success">{{ activeServicesCount }} actives</span>
          </div>
          <div class="kpi-body">
            <h3>Prestations du Site</h3>
            <p class="kpi-number">{{ services.length }}</p>
            <span class="kpi-meta">Offres événementielles</span>
          </div>
          <div class="kpi-arrow">→ Gérer les prestations</div>
        </article>
      </div>

      <!-- Raccourcis d'actions rapides -->
      <div class="quick-actions-bar">
        <h3>⚡ Actions rapides :</h3>
        <div class="action-buttons">
          <a routerLink="/admin/quotes" class="quick-btn">✉️ Traiter les devis</a>
          <a routerLink="/admin/recruitment/applications" class="quick-btn">📥 Voir les CV</a>
          <a routerLink="/admin/events" class="quick-btn">➕ Publier un événement</a>
          <a routerLink="/admin/clients" class="quick-btn">⭐ Ajouter un logo client</a>
          <a routerLink="/admin/services" class="quick-btn">🛎️ Modifier les prestations</a>
          <a href="https://adelyss-events.com" target="_blank" class="quick-btn outline">🌐 Voir le site public</a>
        </div>
      </div>

      <!-- Deux tables récentes : Devis récents & Candidatures récentes -->
      <div class="recent-grid">
        <!-- 5 Derniers Devis -->
        <article class="recent-card">
          <div class="recent-header">
            <h3>✉️ Dernières demandes de devis</h3>
            <a routerLink="/admin/quotes" class="view-all-link">Voir tous les devis ({{ quotes.length }}) →</a>
          </div>

          <div class="table-wrap">
            <table class="recent-table" *ngIf="recentQuotes.length > 0; else noQuotes">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Événement</th>
                  <th>Budget</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let q of recentQuotes" routerLink="/admin/quotes" style="cursor: pointer;">
                  <td>
                    <strong>{{ q.fullName }}</strong><br />
                    <small>{{ q.email }}</small>
                  </td>
                  <td>{{ q.eventType }}</td>
                  <td>{{ q.estimatedBudget ? (q.estimatedBudget + ' TND') : '-' }}</td>
                  <td>
                    <span class="badge" [class.badge-alert]="q.status === 'NEW'">
                      {{ q.status === 'NEW' ? 'Nouveau' : 'Répondu' }}
                    </span>
                  </td>
                  <td><small>{{ q.createdAt | date: 'dd/MM/yyyy' }}</small></td>
                </tr>
              </tbody>
            </table>
            <ng-template #noQuotes>
              <p class="empty-text">Aucun devis reçu pour le moment.</p>
            </ng-template>
          </div>
        </article>

        <!-- 5 Dernières Candidatures -->
        <article class="recent-card">
          <div class="recent-header">
            <h3>📥 Dernières candidatures reçues</h3>
            <a routerLink="/admin/recruitment/applications" class="view-all-link">Voir toutes les candidatures ({{ applications.length }}) →</a>
          </div>

          <div class="table-wrap">
            <table class="recent-table" *ngIf="recentApps.length > 0; else noApps">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste visé</th>
                  <th>CV</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of recentApps" routerLink="/admin/recruitment/applications" style="cursor: pointer;">
                  <td>
                    <strong>{{ a.fullName }}</strong><br />
                    <small>{{ a.email }}</small>
                  </td>
                  <td><span class="pos-tag">{{ a.position }}</span></td>
                  <td>
                    <span *ngIf="a.cvUrl">📁 Joint</span>
                    <span *ngIf="!a.cvUrl">-</span>
                  </td>
                  <td>
                    <span class="badge" [attr.data-status]="a.status">{{ formatStatus(a.status) }}</span>
                  </td>
                  <td><small>{{ a.createdAt | date: 'dd/MM/yyyy' }}</small></td>
                </tr>
              </tbody>
            </table>
            <ng-template #noApps>
              <p class="empty-text">Aucune candidature reçue pour le moment.</p>
            </ng-template>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-shell {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .overline {
        margin: 0;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.12em;
        color: #d4af37;
        font-weight: 700;
      }
      h1 { margin: 0.3rem 0 0; font-size: 2.1rem; color: #1e293b; }
      .date-badge {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 0.55rem 1rem;
        border-radius: 999px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #475569;
        box-shadow: 0 2px 6px rgba(0,0,0,0.02);
      }

      /* Grille KPI */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
      }
      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #d4af37;
        }
        &.highlight {
          border-left: 4px solid #d4af37;
        }
      }
      .kpi-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .kpi-icon {
        font-size: 1.8rem;
      }
      .kpi-body {
        h3 {
          margin: 0 0 0.4rem;
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 600;
        }
        .kpi-number {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }
        .kpi-meta {
          display: block;
          margin-top: 0.6rem;
          font-size: 0.82rem;
          color: #94a3b8;
        }
      }
      .kpi-arrow {
        margin-top: 1.2rem;
        padding-top: 0.8rem;
        border-top: 1px solid #f1f5f9;
        font-size: 0.82rem;
        font-weight: 700;
        color: #d4af37;
      }

      /* Badges */
      .badge {
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        background: #f1f5f9;
        color: #64748b;

        &.badge-alert { background: #fee2e2; color: #b91c1c; }
        &.badge-success { background: #dcfce7; color: #15803d; }

        &[data-status="NEW"] { background: #dbeafe; color: #1e40af; }
        &[data-status="REVIEWED"] { background: #fef3c7; color: #92400e; }
        &[data-status="ACCEPTED"] { background: #dcfce7; color: #166534; }
        &[data-status="REJECTED"] { background: #fee2e2; color: #991b1b; }
        &[data-status="ARCHIVED"] { background: #e2e8f0; color: #475569; }
      }

      /* Actions rapides */
      .quick-actions-bar {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.2rem 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        h3 { margin: 0 0 1rem; font-size: 1rem; color: #1e293b; }
      }
      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }
      .quick-btn {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #1e293b;
        padding: 0.6rem 1.1rem;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          background: #d4af37;
          border-color: #d4af37;
          color: #fff;
          transform: translateY(-1px);
        }
        &.outline {
          border-style: dashed;
        }
      }

      /* Tables récentes */
      .recent-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @media (max-width: 1024px) { .recent-grid { grid-template-columns: 1fr; } }

      .recent-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      }
      .recent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;
        h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
      }
      .view-all-link {
        font-size: 0.85rem;
        color: #d4af37;
        font-weight: 700;
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }

      .table-wrap { overflow-x: auto; }
      .recent-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;

        th {
          text-align: left;
          padding: 0.65rem 0.8rem;
          color: #64748b;
          font-weight: 700;
          font-size: 0.78rem;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        td {
          padding: 0.75rem 0.8rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        tr:hover td { background: #f8fafc; }
      }
      .pos-tag { background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600; }
      .empty-text { text-align: center; color: #94a3b8; padding: 2rem 0; margin: 0; }
    `
  ]
})
export class AdminDashboardComponent implements OnInit {
  private readonly quotesService = inject(AdminQuotesService);
  private readonly recruitmentService = inject(AdminRecruitmentService);
  private readonly messageService = inject(AdminMessageService);
  private readonly eventService = inject(AdminEventService);
  private readonly serviceOfferService = inject(AdminServiceOfferService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  readonly today = new Date();

  quotes: AdminQuote[] = [];
  applications: JobApplication[] = [];
  messages: ContactMessage[] = [];
  events: AdminEvent[] = [];
  services: ServiceOffer[] = [];
  clientCount = 0;

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    // 1. Devis
    this.quotesService.getQuotes().subscribe({
      next: (data) => this.quotes = data,
      error: () => {}
    });

    // 2. Candidatures
    this.recruitmentService.getApplications().subscribe({
      next: (data) => this.applications = data,
      error: () => {}
    });

    // 3. Messages
    this.messageService.getMessages().subscribe({
      next: (data) => this.messages = data,
      error: () => {}
    });

    // 4. Événements
    this.eventService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: () => {}
    });

    // 5. Prestations
    this.serviceOfferService.getServices().subscribe({
      next: (data) => this.services = data,
      error: () => {}
    });

    // 6. Clients
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
    this.http.get<any[]>('/api/admin/partners', { headers }).subscribe({
      next: (data) => {
        this.clientCount = data.filter(p => p.type === 'CLIENT').length;
      },
      error: () => {}
    });
  }

  get newQuotesCount(): number {
    return this.quotes.filter(q => q.status === 'NEW').length;
  }

  get repliedQuotesCount(): number {
    return this.quotes.filter(q => q.status === 'REPLIED').length;
  }

  get newAppsCount(): number {
    return this.applications.filter(a => a.status === 'NEW').length;
  }

  get acceptedAppsCount(): number {
    return this.applications.filter(a => a.status === 'ACCEPTED').length;
  }

  get newMessagesCount(): number {
    return this.messages.filter(m => m.status === 'NEW').length;
  }

  get activeServicesCount(): number {
    return this.services.filter(s => s.active).length;
  }

  get recentQuotes(): AdminQuote[] {
    return [...this.quotes]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }

  get recentApps(): JobApplication[] {
    return [...this.applications]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'NEW': return 'Nouvelle';
      case 'REVIEWED': return 'Consultée';
      case 'ACCEPTED': return 'Retenue ⭐';
      case 'REJECTED': return 'Refusée';
      case 'ARCHIVED': return 'Archivée';
      default: return status || 'Nouveau';
    }
  }
}
