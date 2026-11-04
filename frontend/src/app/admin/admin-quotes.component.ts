import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { AdminQuote, AdminQuotesService } from './admin-quotes.service';
import { exportToExcelCsv } from './excel-export.util';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Gestion commerciale</p>
        <h1>Demandes de devis</h1>
      </div>
      <div class="header-actions">
        <button class="btn btn-excel" (click)="exportQuotesExcel()" [disabled]="!filteredQuotes.length" title="Exporter les devis filtrés vers Excel">
          📊 Exporter en Excel (.csv) ({{ filteredQuotes.length }})
        </button>
      </div>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <!-- KPI Row -->
    <div class="kpi-row">
      <article class="kpi-card">
        <p>Total demandes</p>
        <strong>{{ quotes.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Nouvelles en attente</p>
        <strong class="highlight-gold">{{ countByStatus('NEW') }}</strong>
      </article>
      <article class="kpi-card">
        <p>Répondues / Traitées</p>
        <strong>{{ countByStatus('REPLIED') }}</strong>
      </article>
    </div>

    <!-- Barre de filtres et recherche -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher par client, email, téléphone, détails..."
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''">✕</button>
        </div>

        <div class="filter-group">
          <label>Type :</label>
          <select [(ngModel)]="selectedEventType">
            <option value="ALL">Tous les événements ({{ quotes.length }})</option>
            <option *ngFor="let t of availableEventTypes" [value]="t">
              {{ t }} ({{ countByEventType(t) }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Statut :</label>
          <select [(ngModel)]="selectedStatus">
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouveaux devis</option>
            <option value="REPLIED">Déjà répondus</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tri :</label>
          <select [(ngModel)]="sortBy">
            <option value="date-desc">Plus récent d'abord</option>
            <option value="date-asc">Plus ancien d'abord</option>
            <option value="budget-desc">Budget (Plus élevé)</option>
            <option value="budget-asc">Budget (Plus faible)</option>
          </select>
        </div>
      </div>

      <!-- Barre d'actions groupées si sélection -->
      <div class="bulk-action-bar" *ngIf="selectedQuoteIds.size > 0">
        <div class="bulk-count">
          <span>✓ <strong>{{ selectedQuoteIds.size }}</strong> devis sélectionné(s)</span>
        </div>
        <div class="bulk-buttons">
          <button type="button" class="btn btn-bulk-email" (click)="openBulkEmailModal()">
            ✉️ Relance groupée par email ({{ selectedQuoteIds.size }})
          </button>
          <button type="button" class="btn btn-bulk-clear" (click)="clearSelection()">
            Désélectionner tout
          </button>
        </div>
      </div>
    </div>

    <!-- Grille Liste & Détails -->
    <div class="content-grid">
      <article class="list-card">
        <div class="list-card-header">
          <h2>Inbox devis ({{ filteredQuotes.length }})</h2>
          <label class="select-all-label" *ngIf="filteredQuotes.length > 0">
            <input
              type="checkbox"
              [checked]="isAllSelected()"
              (change)="toggleSelectAll($event)"
            />
            <span>Tout sélectionner</span>
          </label>
        </div>

        <p class="muted" *ngIf="!filteredQuotes.length">Aucune demande de devis ne correspond aux critères.</p>

        <ul class="quote-list">
          <li
            *ngFor="let quote of filteredQuotes"
            [class.active]="selectedQuote?.id === quote.id"
            (click)="selectQuote(quote)"
          >
            <div class="quote-item-header">
              <label class="quote-checkbox-wrapper" (click)="$event.stopPropagation()">
                <input
                  type="checkbox"
                  [checked]="selectedQuoteIds.has(quote.id)"
                  (change)="toggleQuoteSelection(quote.id, $event)"
                />
              </label>
              <div class="quote-item-main">
                <div class="row-top">
                  <strong>{{ quote.fullName }}</strong>
                  <span class="badge" [class.badge-new]="quote.status === 'NEW'">
                    {{ quote.status === 'NEW' ? 'Nouveau' : 'Répondu' }}
                  </span>
                </div>
                <span class="quote-event-type">🏷️ {{ quote.eventType }}</span>
                <span class="quote-email">✉️ {{ quote.email }}</span>
                <div class="row-footer">
                  <span class="quote-budget" *ngIf="quote.estimatedBudget">💰 {{ quote.estimatedBudget }} TND</span>
                  <small>{{ quote.createdAt | date: 'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </article>

      <!-- Détail Demande Devis -->
      <article class="detail-card" *ngIf="selectedQuote as q">
        <div class="detail-top-bar">
          <h2>Détail demande #{{ q.id }}</h2>
          <span class="badge badge-lg" [class.badge-new]="q.status === 'NEW'">
            {{ q.status === 'NEW' ? 'Nouveau devis' : 'Répondu' }}
          </span>
        </div>

        <div class="detail-grid">
          <p><strong>Nom complet :</strong> {{ q.fullName }}</p>
          <p><strong>Email :</strong> <a [href]="'mailto:' + q.email">{{ q.email }}</a></p>
          <p><strong>Téléphone :</strong> <a [href]="'tel:' + q.phone">{{ q.phone }}</a></p>
          <p><strong>Type événement :</strong> <span class="highlight-tag">{{ q.eventType }}</span></p>
          <p><strong>Budget estimatif :</strong> {{ q.estimatedBudget ? (q.estimatedBudget + ' TND') : 'Non renseigné' }}</p>
          <p><strong>Date prévue :</strong> {{ q.eventDate ?? 'Non précisée' }}</p>
        </div>

        <div class="details-box">
          <h3>Détails du projet &amp; besoins</h3>
          <p>{{ q.details ?? 'Aucune précision supplémentaire.' }}</p>
        </div>

        <div class="reply-section">
          <h3>✉️ Répondre au client par email</h3>
          <form [formGroup]="replyForm" (ngSubmit)="sendReply()">
            <label>
              Objet du message
              <input type="text" formControlName="subject" />
            </label>
            <label>
              Message
              <textarea rows="7" formControlName="message" placeholder="Votre proposition chiffrée, disponibilités, questions..."></textarea>
            </label>
            <button type="submit" class="btn btn-gold" [disabled]="isSubmittingReply">
              {{ isSubmittingReply ? 'Envoi en cours...' : 'Envoyer la réponse' }}
            </button>
          </form>
        </div>
      </article>
    </div>

    <!-- Modal d'emailing de relance groupée -->
    <div class="modal-backdrop" *ngIf="showBulkModal" (click)="closeBulkModal()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>✉️ Envoi groupé de relance ({{ getSelectedQuotes().length }} destinataires)</h2>
          <button class="close-btn" (click)="closeBulkModal()">✕</button>
        </div>

        <div class="modal-body">
          <p class="modal-intro">
            Vous vous apprêtez à envoyer un email personnalisé de relance à
            <strong>{{ getSelectedQuotes().length }} clients</strong> sélectionnés :
          </p>

          <div class="recipients-tags">
            <span class="recipient-tag" *ngFor="let q of getSelectedQuotes()">
              {{ q.fullName }} ({{ q.email }})
            </span>
          </div>

          <div class="form-group">
            <label>Objet du message de relance</label>
            <input type="text" [(ngModel)]="bulkSubject" class="form-control" />
          </div>

          <div class="form-group">
            <label>Corps du message de relance</label>
            <textarea rows="6" [(ngModel)]="bulkMessage" class="form-control"></textarea>
          </div>

          <!-- Barre de progression de l'envoi -->
          <div class="progress-box" *ngIf="isSendingBulk">
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" [style.width.%]="bulkProgressPercent"></div>
            </div>
            <p class="progress-text">Envoi en cours : {{ bulkCurrentIndex }} / {{ getSelectedQuotes().length }}...</p>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeBulkModal()" [disabled]="isSendingBulk">
            Annuler
          </button>
          <button type="button" class="btn btn-gold" (click)="executeBulkEmail()" [disabled]="isSendingBulk || !bulkSubject || !bulkMessage">
            {{ isSendingBulk ? 'Envoi groupé en cours...' : '🚀 Envoyer les ' + getSelectedQuotes().length + ' relances' }}
          </button>
        </div>
      </div>
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
      .overline {
        margin: 0;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.12em;
        color: #d4af37;
        font-weight: 700;
      }
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

      .status { color: #10b981; font-weight: 600; margin-bottom: 1rem; }
      .error { color: #ef4444; font-weight: 600; margin-bottom: 1rem; }

      .kpi-row {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-bottom: 1.5rem;
      }
      .kpi-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
      }
      .kpi-card p { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
      .kpi-card strong { display: block; margin-top: 0.4rem; color: #1e293b; font-size: 1.7rem; }
      .highlight-gold { color: #d4af37 !important; }

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
        .clear-btn { position: absolute; right: 0.8rem; background: transparent; border: none; color: #94a3b8; cursor: pointer; }
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

      /* Barre d'action collective */
      .bulk-action-bar {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.8rem;
        background: #f8fafc;
        padding: 0.8rem 1rem;
        border-radius: 8px;
      }
      .bulk-count {
        color: #1e293b;
        font-size: 0.95rem;
      }
      .bulk-buttons {
        display: flex;
        gap: 0.8rem;
      }
      .btn-bulk-email {
        background: #d4af37;
        color: #0f172a;
        font-weight: 700;
        border: none;
        padding: 0.55rem 1.1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { background: #b89324; color: #fff; }
      }
      .btn-bulk-clear {
        background: white;
        border: 1px solid #cbd5e1;
        padding: 0.55rem 0.9rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        color: #64748b;
        &:hover { background: #f1f5f9; }
      }

      /* Grille Inbox & Détail */
      .content-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: 380px 1fr;
        align-items: start;
      }
      @media (max-width: 960px) { .content-grid { grid-template-columns: 1fr; } }

      .list-card, .detail-card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        background: #fff;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      }
      .list-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;
        h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
      }
      .select-all-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: #64748b;
        cursor: pointer;
      }

      .quote-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        max-height: 700px;
        overflow-y: auto;
      }
      .quote-list li {
        border: 1px solid #f1f5f9;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        cursor: pointer;
        transition: all 0.15s ease;
        background: #fff;

        &:hover { background: #f8fafc; border-color: #cbd5e1; }
        &.active { border-color: #d4af37; background: #fffcf4; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1); }
      }

      .quote-item-header {
        display: flex;
        gap: 0.8rem;
        align-items: flex-start;
      }
      .quote-checkbox-wrapper {
        margin-top: 0.2rem;
        cursor: pointer;
      }
      .quote-item-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .row-top { display: flex; justify-content: space-between; align-items: center; }
      .quote-event-type { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
      .quote-email { font-size: 0.82rem; color: #64748b; }
      .row-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.3rem; }
      .quote-budget { font-size: 0.82rem; font-weight: 700; color: #10b981; }

      .badge {
        font-size: 0.72rem;
        font-weight: 700;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        background: #e2e8f0;
        color: #475569;
      }
      .badge-new { background: #fef3c7; color: #92400e; }
      .badge-lg { font-size: 0.85rem; padding: 0.3rem 0.8rem; }

      /* Détail */
      .detail-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f1f5f9;
        h2 { margin: 0; color: #0f172a; font-size: 1.5rem; }
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.8rem;
        p { margin: 0; color: #334155; font-size: 0.95rem; }
        a { color: #d4af37; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
      }
      .highlight-tag { background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.6rem; border-radius: 4px; font-weight: 600; }

      .details-box {
        background: #f8fafc;
        padding: 1.3rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        border: 1px solid #e2e8f0;
        h3 { margin: 0 0 0.8rem; font-size: 1.05rem; color: #1e293b; }
        p { margin: 0; color: #475569; line-height: 1.65; white-space: pre-wrap; font-size: 0.95rem; }
      }

      .reply-section {
        border-top: 1px solid #e2e8f0;
        padding-top: 1.5rem;
        h3 { margin: 0 0 1rem; font-size: 1.15rem; color: #1e293b; }
        form { display: flex; flex-direction: column; gap: 0.9rem; }
        label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        input, textarea {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.75rem 0.9rem;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          &:focus { border-color: #d4af37; }
        }
        button[type='submit'] {
          background: #d4af37;
          color: #0f172a;
          border: none;
          padding: 0.85rem 1.4rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          align-self: flex-start;
          transition: all 0.2s;
          &:hover:not(:disabled) { background: #b89324; color: #fff; }
          &:disabled { opacity: 0.6; cursor: not-allowed; }
        }
      }

      /* Modal de relance */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .modal-dialog {
        background: white;
        border-radius: 16px;
        width: min(650px, 100%);
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.2rem 1.5rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
        .close-btn { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
      }
      .modal-body {
        padding: 1.5rem;
        max-height: 480px;
        overflow-y: auto;
      }
      .modal-intro { margin: 0 0 1rem; color: #475569; }
      .recipients-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .recipient-tag {
        background: #e0f2fe;
        color: #0369a1;
        font-size: 0.78rem;
        padding: 0.3rem 0.65rem;
        border-radius: 6px;
        font-weight: 600;
      }
      .form-group {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        label { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
      }
      .form-control {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.7rem 0.9rem;
        font-family: inherit;
        font-size: 0.92rem;
        outline: none;
        &:focus { border-color: #d4af37; }
      }

      .progress-box {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .progress-bar-wrap {
        height: 8px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: #10b981;
        transition: width 0.3s ease;
      }
      .progress-text { margin: 0.5rem 0 0; font-size: 0.85rem; font-weight: 600; color: #059669; }

      .modal-footer {
        padding: 1rem 1.5rem;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;

        .btn-secondary {
          background: white;
          border: 1px solid #cbd5e1;
          padding: 0.65rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-gold {
          background: #d4af37;
          color: #0f172a;
          border: none;
          padding: 0.65rem 1.4rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          &:disabled { opacity: 0.6; cursor: not-allowed; }
        }
      }
    `
  ]
})
export class AdminQuotesComponent implements OnInit {
  private readonly quotesService = inject(AdminQuotesService);
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  quotes: AdminQuote[] = [];
  selectedQuote: AdminQuote | null = null;
  errorMessage: string | null = null;
  infoMessage: string | null = null;
  isSubmittingReply = false;

  // Filtres
  searchQuery = '';
  selectedEventType = 'ALL';
  selectedStatus = 'ALL';
  sortBy = 'date-desc';

  // Sélection multiple & Relance groupée
  selectedQuoteIds = new Set<number>();
  showBulkModal = false;
  bulkSubject = 'Suivi de votre demande de devis — Adelyss Events';
  bulkMessage = `Bonjour,\n\nNous faisons suite à votre demande de devis concernant votre projet événementiel.\n\nNotre équipe se tient à votre entière disposition pour échanger par téléphone ou convenir d'un rendez-vous afin d'affiner vos besoins et vous proposer notre offre la plus adaptée.\n\nRestant à votre écoute,\n\nBien cordialement,\nL'équipe Adelyss Events\nTél : 25 944 684\ncontact@adelyss-events.com`;
  isSendingBulk = false;
  bulkCurrentIndex = 0;
  bulkProgressPercent = 0;

  readonly replyForm = this.fb.group({
    subject: ['Votre demande de devis — Adelyss Events', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.loadQuotes();
  }

  get availableEventTypes(): string[] {
    const set = new Set<string>();
    for (const q of this.quotes) {
      if (q.eventType && q.eventType.trim()) {
        set.add(q.eventType.trim());
      }
    }
    return Array.from(set).sort();
  }

  countByEventType(type: string): number {
    return this.quotes.filter(q => q.eventType === type).length;
  }

  countByStatus(status: string): number {
    return this.quotes.filter((quote) => quote.status === status).length;
  }

  get filteredQuotes(): AdminQuote[] {
    let list = [...this.quotes];

    // Filtre texte
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item =>
        (item.fullName && item.fullName.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q)) ||
        (item.eventType && item.eventType.toLowerCase().includes(q)) ||
        (item.details && item.details.toLowerCase().includes(q))
      );
    }

    // Filtre type d'événement
    if (this.selectedEventType !== 'ALL') {
      list = list.filter(item => item.eventType === this.selectedEventType);
    }

    // Filtre statut
    if (this.selectedStatus !== 'ALL') {
      list = list.filter(item => item.status === this.selectedStatus);
    }

    // Tri
    list.sort((a, b) => {
      if (this.sortBy === 'date-desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (this.sortBy === 'date-asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (this.sortBy === 'budget-desc') {
        return (b.estimatedBudget || 0) - (a.estimatedBudget || 0);
      }
      if (this.sortBy === 'budget-asc') {
        return (a.estimatedBudget || 0) - (b.estimatedBudget || 0);
      }
      return 0;
    });

    return list;
  }

  selectQuote(quote: AdminQuote): void {
    this.selectedQuote = quote;
    this.infoMessage = null;
    this.errorMessage = null;
  }

  // Sélection multiple
  toggleQuoteSelection(id: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedQuoteIds.add(id);
    } else {
      this.selectedQuoteIds.delete(id);
    }
  }

  isAllSelected(): boolean {
    const list = this.filteredQuotes;
    return list.length > 0 && list.every(q => this.selectedQuoteIds.has(q.id));
  }

  toggleSelectAll(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.filteredQuotes.forEach(q => this.selectedQuoteIds.add(q.id));
    } else {
      this.selectedQuoteIds.clear();
    }
  }

  clearSelection(): void {
    this.selectedQuoteIds.clear();
  }

  getSelectedQuotes(): AdminQuote[] {
    return this.quotes.filter(q => this.selectedQuoteIds.has(q.id));
  }

  // Modal Emailing
  openBulkEmailModal(): void {
    if (!this.selectedQuoteIds.size) return;
    this.showBulkModal = true;
    this.isSendingBulk = false;
    this.bulkCurrentIndex = 0;
    this.bulkProgressPercent = 0;
  }

  closeBulkModal(): void {
    if (this.isSendingBulk) return;
    this.showBulkModal = false;
  }

  async executeBulkEmail(): Promise<void> {
    const selected = this.getSelectedQuotes();
    if (!selected.length) return;

    this.isSendingBulk = true;
    this.bulkCurrentIndex = 0;
    this.bulkProgressPercent = 0;
    let successCount = 0;

    for (let i = 0; i < selected.length; i++) {
      const quote = selected[i];
      this.bulkCurrentIndex = i + 1;
      this.bulkProgressPercent = Math.round(((i + 1) / selected.length) * 100);

      try {
        await this.quotesService.replyToQuote(quote.id, this.bulkSubject, this.bulkMessage, 'REPLIED').toPromise();
        quote.status = 'REPLIED';
        successCount++;
      } catch (e) {
        console.error(`Erreur relance devis #${quote.id}:`, e);
      }
    }

    this.isSendingBulk = false;
    this.showBulkModal = false;
    this.selectedQuoteIds.clear();
    this.infoMessage = `Relance groupée terminée avec succès : ${successCount}/${selected.length} emails envoyés.`;
  }

  sendReply(): void {
    if (!this.selectedQuote) return;
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }

    const { subject, message } = this.replyForm.getRawValue();
    this.isSubmittingReply = true;
    this.errorMessage = null;
    this.infoMessage = null;

    this.quotesService.replyToQuote(this.selectedQuote.id, subject ?? '', message ?? '').subscribe({
      next: (updatedQuote) => {
        this.isSubmittingReply = false;
        this.infoMessage = `Réponse envoyée avec succès à ${updatedQuote.fullName} (${updatedQuote.email}).`;
        this.selectedQuote = updatedQuote;
        this.quotes = this.quotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
        this.replyForm.patchValue({ message: '' });
      },
      error: () => {
        this.isSubmittingReply = false;
        this.errorMessage = "Échec de l'envoi de l'email. Veuillez vérifier le relais SMTP.";
      },
    });
  }

  exportQuotesExcel(): void {
    const list = this.filteredQuotes;
    if (!list.length) return;

    const headers = [
      'ID',
      'Date de demande',
      'Nom complet',
      'Email',
      'Téléphone',
      'Type d\'événement',
      'Date prévue',
      'Budget estimatif (TND)',
      'Statut',
      'Détails du projet'
    ];

    const rows = list.map(q => [
      q.id,
      q.createdAt ? new Date(q.createdAt).toLocaleString('fr-FR') : '',
      q.fullName,
      q.email,
      q.phone,
      q.eventType,
      q.eventDate || 'Non renseigné',
      q.estimatedBudget ? `${q.estimatedBudget} TND` : 'Non renseigné',
      q.status === 'NEW' ? 'Nouveau' : 'Répondu',
      q.details ? q.details.replace(/\r?\n/g, ' ') : ''
    ]);

    const filename = `devis_adelyss_events_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToExcelCsv(filename, headers, rows);
    this.infoMessage = `Export Excel réussi (${list.length} devis exportés).`;
  }

  private loadQuotes(): void {
    this.quotesService.getQuotes().subscribe({
      next: (quotes) => {
        this.quotes = quotes;
        this.selectedQuote = quotes.length ? quotes[0] : null;
      },
      error: () => {
        this.errorMessage = "Impossible de charger les devis. Reconnectez-vous.";
      },
    });
  }
}
