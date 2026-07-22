import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication, AdminRecruitmentService } from './admin-recruitment.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Recrutement</p>
        <h1>Candidatures</h1>
      </div>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="content-grid">
      <article class="list-card">
        <h2>Inbox Candidatures</h2>
        <p class="muted" *ngIf="!applications.length">Aucune candidature pour le moment.</p>
        <ul>
          <li
            *ngFor="let app of applications"
            [class.active]="selectedApp?.id === app.id"
            (click)="selectApp(app)"
          >
            <div class="row-top">
              <strong>{{ app.fullName }}</strong>
              <span class="badge" [class.badge-new]="app.status === 'NEW'">{{ app.status }}</span>
            </div>
            <span>{{ app.position }}</span>
            <small>{{ app.createdAt | date: 'medium' }}</small>
          </li>
        </ul>
      </article>

      <article class="detail-card" *ngIf="selectedApp as app">
        <div class="detail-header">
          <h2>{{ app.fullName }}</h2>
          <div class="status-actions">
            <button (click)="updateStatus('REVIEWED')" [class.active]="app.status === 'REVIEWED'">Vu</button>
            <button (click)="updateStatus('ACCEPTED')" [class.active]="app.status === 'ACCEPTED'" class="success">Retenu</button>
            <button (click)="updateStatus('REJECTED')" [class.active]="app.status === 'REJECTED'" class="danger">Refusé</button>
          </div>
        </div>
        
        <div class="detail-grid">
          <p><strong>Email:</strong> {{ app.email }}</p>
          <p><strong>Téléphone:</strong> {{ app.phone || 'Non renseigné' }}</p>
          <p><strong>Poste visé:</strong> {{ app.position }}</p>
          <p><strong>Date:</strong> {{ app.createdAt | date: 'longDate' }}</p>
        </div>
        
        <div class="motivation-block">
          <h3>Lettre de motivation</h3>
          <p>{{ app.motivation }}</p>
        </div>

        <div class="cv-block" *ngIf="app.cvUrl">
          <h3>Curriculum Vitae</h3>
          <a [href]="app.cvUrl" target="_blank" class="download-btn">
            📁 Télécharger le CV
          </a>
        </div>
      </article>
    </div>
  `,
  styles: [
    `
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }
      
      .content-grid { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; align-items: start; }
      @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
      
      .list-card, .detail-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
      .list-card h2 { margin: 0 0 1.5rem; font-size: 1.2rem; }
      .list-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .list-card li { padding: 1rem; border: 1px solid #f1f5f9; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
      .list-card li:hover { background: #f8fafc; }
      .list-card li.active { border-color: #d4af37; background: rgba(212, 175, 55, 0.05); }
      .row-top { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
      .list-card span { display: block; color: #475569; font-size: 0.9rem; }
      .list-card small { color: #94a3b8; font-size: 0.8rem; }
      
      .badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #e2e8f0; color: #64748b; }
      .badge-new { background: #3b82f6; color: white; }

      .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
      .detail-header h2 { margin: 0; color: #0f172a; }
      .status-actions { display: flex; gap: 0.5rem; }
      .status-actions button { background: white; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #475569; }
      .status-actions button:hover { background: #f1f5f9; }
      .status-actions button.active { background: #e2e8f0; border-color: #94a3b8; }
      .status-actions button.success.active { background: #10b981; color: white; border-color: #10b981; }
      .status-actions button.danger.active { background: #ef4444; color: white; border-color: #ef4444; }

      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
      .detail-grid p { margin: 0; color: #334155; font-size: 0.95rem; }
      
      .motivation-block { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
      .motivation-block h3, .cv-block h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #1e293b; }
      .motivation-block p { margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap; }

      .cv-block { padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
      .download-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #0f172a; color: white; text-decoration: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
      .download-btn:hover { background: #1e293b; }

      .status { color: #10b981; font-weight: 600; }
      .error { color: #ef4444; font-weight: 600; }
    `
  ]
})
export class AdminApplicationsComponent implements OnInit {
  private readonly recruitmentService = inject(AdminRecruitmentService);

  applications: JobApplication[] = [];
  selectedApp: JobApplication | null = null;
  infoMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.recruitmentService.getApplications().subscribe({
      next: (data) => this.applications = data,
      error: () => this.errorMessage = 'Erreur lors du chargement des candidatures.'
    });
  }

  selectApp(app: JobApplication) {
    this.selectedApp = app;
    if (app.status === 'NEW') {
      this.updateStatus('REVIEWED', false);
    }
  }

  updateStatus(status: string, notify = true) {
    if (!this.selectedApp) return;
    
    this.recruitmentService.updateApplicationStatus(this.selectedApp.id, status).subscribe({
      next: (updated) => {
        this.selectedApp!.status = updated.status;
        const idx = this.applications.findIndex(a => a.id === updated.id);
        if (idx !== -1) this.applications[idx] = updated;
        if (notify) this.infoMessage = 'Statut mis à jour.';
      },
      error: () => {
        if (notify) this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }
}
