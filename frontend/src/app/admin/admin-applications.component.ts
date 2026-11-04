import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobApplication, AdminRecruitmentService } from './admin-recruitment.service';
import { exportToExcelCsv } from './excel-export.util';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Recrutement & Talents</p>
        <h1>Candidatures</h1>
      </div>
      <div class="header-actions">
        <button class="btn btn-excel" (click)="exportToExcel()" [disabled]="!filteredApplications.length" title="Exporter les candidatures filtrées vers Excel">
          📊 Exporter en Excel (.csv) ({{ filteredApplications.length }})
        </button>
      </div>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <!-- Barre de filtres et recherche -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher par nom, email, téléphone, compétences..."
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''">✕</button>
        </div>

        <div class="filter-group">
          <label>Poste :</label>
          <select [(ngModel)]="selectedPosition">
            <option value="ALL">Tous les postes ({{ applications.length }})</option>
            <option *ngFor="let pos of availablePositions" [value]="pos">
              {{ pos }} ({{ countByPosition(pos) }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Statut :</label>
          <select [(ngModel)]="selectedStatus">
            <option value="ACTIVE">Actives (hors archives)</option>
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouvelles</option>
            <option value="REVIEWED">Consultées (Vu)</option>
            <option value="ACCEPTED">Retenues</option>
            <option value="REJECTED">Refusées</option>
            <option value="ARCHIVED">Archivées 📦</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tri :</label>
          <select [(ngModel)]="sortBy">
            <option value="date-desc">Plus récent d'abord</option>
            <option value="date-asc">Plus ancien d'abord</option>
            <option value="name-asc">Nom (A → Z)</option>
            <option value="name-desc">Nom (Z → A)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grille Liste & Détails -->
    <div class="content-grid">
      <article class="list-card">
        <div class="list-header">
          <h2>Candidatures ({{ filteredApplications.length }})</h2>
        </div>

        <p class="muted" *ngIf="!filteredApplications.length">
          Aucune candidature ne correspond à vos filtres.
        </p>

        <ul class="app-list">
          <li
            *ngFor="let app of filteredApplications"
            [class.active]="selectedApp?.id === app.id"
            [class.is-archived]="app.status === 'ARCHIVED'"
            (click)="selectApp(app)"
          >
            <div class="row-top">
              <strong>{{ app.fullName }}</strong>
              <span class="badge" [attr.data-status]="app.status">{{ formatStatus(app.status) }}</span>
            </div>
            <span class="app-position">💼 {{ app.position }}</span>
            <div class="row-meta">
              <small>📅 {{ app.createdAt | date: 'dd/MM/yyyy HH:mm' }}</small>
              <button
                type="button"
                class="archive-mini-btn"
                (click)="toggleArchive(app, $event)"
                [title]="app.status === 'ARCHIVED' ? 'Désarchiver' : 'Archiver la candidature'"
              >
                {{ app.status === 'ARCHIVED' ? '↩️ Désarchiver' : '📦 Archiver' }}
              </button>
            </div>
          </li>
        </ul>
      </article>

      <!-- Détail Candidature sélectionnée -->
      <article class="detail-card" *ngIf="selectedApp as app">
        <div class="detail-header">
          <div>
            <h2>{{ app.fullName }}</h2>
            <span class="badge badge-lg" [attr.data-status]="app.status">{{ formatStatus(app.status) }}</span>
          </div>

          <div class="status-actions">
            <button (click)="updateStatus('REVIEWED')" [class.active]="app.status === 'REVIEWED'">Vu</button>
            <button (click)="updateStatus('ACCEPTED')" [class.active]="app.status === 'ACCEPTED'" class="btn-success">Retenu</button>
            <button (click)="updateStatus('REJECTED')" [class.active]="app.status === 'REJECTED'" class="btn-danger">Refusé</button>
            <button (click)="toggleArchive(app)" class="btn-archive">
              {{ app.status === 'ARCHIVED' ? '↩️ Restaurer' : '📦 Archiver' }}
            </button>
            <button (click)="deleteApp(app.id)" class="btn-delete" title="Supprimer définitivement">🗑️</button>
          </div>
        </div>

        <div class="detail-grid">
          <p><strong>Email :</strong> <a [href]="'mailto:' + app.email">{{ app.email }}</a></p>
          <p><strong>Téléphone :</strong> <a [href]="'tel:' + app.phone">{{ app.phone || 'Non renseigné' }}</a></p>
          <p><strong>Poste visé :</strong> <span class="highlight-position">{{ app.position }}</span></p>
          <p><strong>Date de réception :</strong> {{ app.createdAt | date: 'longDate' }} à {{ app.createdAt | date: 'shortTime' }}</p>
        </div>

        <div class="motivation-block">
          <h3>Lettre / Message de motivation</h3>
          <p>{{ app.motivation }}</p>
        </div>

        <div class="cv-block" *ngIf="app.cvUrl">
          <div class="cv-header">
            <h3>Curriculum Vitae</h3>
            <span class="cv-badge">Document joint</span>
          </div>
          <a [href]="app.cvUrl" target="_blank" class="download-btn">
            📥 Télécharger le CV ({{ getFileName(app.cvUrl) }})
          </a>
        </div>
      </article>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; letter-spacing: 0.1em; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }

      .btn-excel {
        background: #10b981;
        color: white;
        border: none;
        padding: 0.75rem 1.4rem;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }

      /* Filtres */
      .filter-card {
        background: white;
        border-radius: 12px;
        padding: 1.2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid #e2e8f0;
      }
      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
      }
      .search-box {
        flex: 2;
        min-width: 260px;
        position: relative;
        display: flex;
        align-items: center;

        .search-icon { position: absolute; left: 1rem; opacity: 0.5; }
        input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.6rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.92rem;
          outline: none;
          &:focus { border-color: #d4af37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15); }
        }
        .clear-btn {
          position: absolute;
          right: 0.8rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        select {
          padding: 0.6rem 0.9rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.9rem;
          background: #fff;
          outline: none;
          &:focus { border-color: #d4af37; }
        }
      }

      /* Grille principale */
      .content-grid {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 1.5rem;
        align-items: start;
      }
      @media (max-width: 960px) { .content-grid { grid-template-columns: 1fr; } }

      .list-card, .detail-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid #e2e8f0;
      }
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;
        h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
      }

      .app-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        max-height: 700px;
        overflow-y: auto;
      }
      .app-list li {
        padding: 1rem;
        border: 1px solid #f1f5f9;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        background: #fff;

        &:hover { background: #f8fafc; border-color: #cbd5e1; }
        &.active { border-color: #d4af37; background: #fffcf4; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1); }
        &.is-archived { opacity: 0.65; background: #f8fafc; }
      }

      .row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
      .app-position { display: block; color: #1e293b; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.4rem; }
      .row-meta { display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 0.8rem; }
      
      .archive-mini-btn {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.2rem 0.5rem;
        font-size: 0.75rem;
        cursor: pointer;
        color: #475569;
        &:hover { background: #e2e8f0; color: #0f172a; }
      }

      /* Badges */
      .badge {
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        background: #e2e8f0;
        color: #64748b;

        &[data-status="NEW"] { background: #dbeafe; color: #1e40af; }
        &[data-status="REVIEWED"] { background: #fef3c7; color: #92400e; }
        &[data-status="ACCEPTED"] { background: #dcfce7; color: #166534; }
        &[data-status="REJECTED"] { background: #fee2e2; color: #991b1b; }
        &[data-status="ARCHIVED"] { background: #e2e8f0; color: #475569; }
      }
      .badge-lg { font-size: 0.85rem; padding: 0.3rem 0.8rem; display: inline-block; margin-top: 0.5rem; }

      /* Détail */
      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.8rem;
        padding-bottom: 1.2rem;
        border-bottom: 1px solid #f1f5f9;
        flex-wrap: wrap;
        gap: 1rem;
        h2 { margin: 0; color: #0f172a; font-size: 1.6rem; }
      }
      .status-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        button {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          transition: all 0.15s;

          &:hover { background: #f1f5f9; }
          &.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        }
        .btn-success.active { background: #10b981; color: white; border-color: #10b981; }
        .btn-danger.active { background: #ef4444; color: white; border-color: #ef4444; }
        .btn-archive { background: #f8fafc; }
        .btn-delete { background: #fff; border-color: #fca5a5; &:hover { background: #fee2e2; } }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.8rem;
        p { margin: 0; color: #334155; font-size: 0.95rem; }
        a { color: #d4af37; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
      }
      .highlight-position { color: #0f172a; font-weight: 700; background: #fffaec; padding: 0.15rem 0.5rem; border-radius: 4px; }

      .motivation-block {
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1.8rem;
        border: 1px solid #e2e8f0;
        h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #1e293b; }
        p { margin: 0; color: #475569; line-height: 1.7; white-space: pre-wrap; font-size: 0.95rem; }
      }

      .cv-block {
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
      }
      .cv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; h3 { margin: 0; font-size: 1.1rem; } }
      .cv-badge { font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600; }
      .download-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        background: #0f172a;
        color: white;
        text-decoration: none;
        padding: 0.85rem 1.6rem;
        border-radius: 10px;
        font-weight: 600;
        transition: background 0.2s, transform 0.2s;
        &:hover { background: #1e293b; transform: translateY(-2px); }
      }

      .status { color: #10b981; font-weight: 600; }
      .error { color: #ef4444; font-weight: 600; }
      .muted { color: #94a3b8; }
    `
  ]
})
export class AdminApplicationsComponent implements OnInit {
  private readonly recruitmentService = inject(AdminRecruitmentService);

  applications: JobApplication[] = [];
  selectedApp: JobApplication | null = null;
  infoMessage = '';
  errorMessage = '';

  // Filtres
  searchQuery = '';
  selectedPosition = 'ALL';
  selectedStatus = 'ACTIVE';
  sortBy = 'date-desc';

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.recruitmentService.getApplications().subscribe({
      next: (data) => {
        this.applications = data;
        if (data.length && !this.selectedApp) {
          this.selectedApp = data[0];
        }
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des candidatures.'
    });
  }

  get availablePositions(): string[] {
    const set = new Set<string>();
    for (const app of this.applications) {
      if (app.position && app.position.trim()) {
        set.add(app.position.trim());
      }
    }
    return Array.from(set).sort();
  }

  countByPosition(pos: string): number {
    return this.applications.filter(a => a.position === pos).length;
  }

  get filteredApplications(): JobApplication[] {
    let list = [...this.applications];

    // Filtre texte
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.fullName && a.fullName.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.phone && a.phone.includes(q)) ||
        (a.position && a.position.toLowerCase().includes(q)) ||
        (a.motivation && a.motivation.toLowerCase().includes(q))
      );
    }

    // Filtre poste
    if (this.selectedPosition !== 'ALL') {
      list = list.filter(a => a.position === this.selectedPosition);
    }

    // Filtre statut
    if (this.selectedStatus === 'ACTIVE') {
      list = list.filter(a => a.status !== 'ARCHIVED');
    } else if (this.selectedStatus !== 'ALL') {
      list = list.filter(a => a.status === this.selectedStatus);
    }

    // Tri
    list.sort((a, b) => {
      if (this.sortBy === 'date-desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (this.sortBy === 'date-asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (this.sortBy === 'name-asc') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      if (this.sortBy === 'name-desc') {
        return (b.fullName || '').localeCompare(a.fullName || '');
      }
      return 0;
    });

    return list;
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
        if (notify) this.infoMessage = `Statut mis à jour : ${this.formatStatus(status)}.`;
      },
      error: () => {
        if (notify) this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  toggleArchive(app: JobApplication, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const newStatus = app.status === 'ARCHIVED' ? 'REVIEWED' : 'ARCHIVED';
    this.recruitmentService.updateApplicationStatus(app.id, newStatus).subscribe({
      next: (updated) => {
        app.status = updated.status;
        if (this.selectedApp?.id === app.id) {
          this.selectedApp.status = updated.status;
        }
        this.infoMessage = newStatus === 'ARCHIVED'
          ? `Candidature de ${app.fullName} archivée 📦.`
          : `Candidature de ${app.fullName} restaurée.`;
      },
      error: () => this.errorMessage = "Erreur lors de l'archivage."
    });
  }

  deleteApp(id: number) {
    if (confirm('Voulez-vous supprimer définitivement cette candidature ?')) {
      this.recruitmentService.deleteApplication(id).subscribe({
        next: () => {
          this.applications = this.applications.filter(a => a.id !== id);
          this.selectedApp = this.filteredApplications.length ? this.filteredApplications[0] : null;
          this.infoMessage = 'Candidature supprimée.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }

  exportToExcel() {
    const list = this.filteredApplications;
    if (!list.length) return;

    const headers = [
      'ID',
      'Date de réception',
      'Nom & Prénom',
      'Poste visé',
      'Statut',
      'Email',
      'Téléphone',
      'Lien CV',
      'Lettre de motivation'
    ];

    const rows = list.map(app => [
      app.id,
      app.createdAt ? new Date(app.createdAt).toLocaleString('fr-FR') : '',
      app.fullName,
      app.position,
      this.formatStatus(app.status),
      app.email,
      app.phone || '',
      app.cvUrl ? `https://adelyss-events.com${app.cvUrl}` : 'Aucun',
      app.motivation ? app.motivation.replace(/\r?\n/g, ' ') : ''
    ]);

    const slug = this.selectedPosition !== 'ALL'
      ? this.selectedPosition.toLowerCase().replace(/[^a-z0-9]/g, '_')
      : 'toutes';

    const filename = `candidatures_${slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToExcelCsv(filename, headers, rows);
    this.infoMessage = `Export Excel réussi (${list.length} candidatures exportées).`;
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'NEW': return 'Nouvelle';
      case 'REVIEWED': return 'Consultée (Vu)';
      case 'ACCEPTED': return 'Retenue ⭐';
      case 'REJECTED': return 'Refusée';
      case 'ARCHIVED': return 'Archivée 📦';
      default: return status || 'Nouveau';
    }
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}
