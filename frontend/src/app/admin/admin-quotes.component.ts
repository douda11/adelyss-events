import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { AdminQuote, AdminQuotesService } from './admin-quotes.service';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Gestion client</p>
        <h1>Demandes de devis</h1>
      </div>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="kpi-row">
      <article class="kpi-card">
        <p>Total demandes</p>
        <strong>{{ quotes.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Nouvelles</p>
        <strong>{{ countByStatus('NEW') }}</strong>
      </article>
      <article class="kpi-card">
        <p>Repondues</p>
        <strong>{{ countByStatus('REPLIED') }}</strong>
      </article>
    </div>

    <div class="content-grid">
      <article class="list-card">
        <h2>Inbox</h2>
        <p class="muted" *ngIf="!quotes.length">Aucune demande pour le moment.</p>
        <ul>
          <li
            *ngFor="let quote of quotes"
            [class.active]="selectedQuote?.id === quote.id"
            (click)="selectQuote(quote)"
          >
            <div class="row-top">
              <strong>{{ quote.fullName }}</strong>
              <span class="badge" [class.badge-new]="quote.status === 'NEW'">{{ quote.status }}</span>
            </div>
            <span>{{ quote.email }}</span>
            <small>{{ quote.createdAt | date: 'medium' }}</small>
          </li>
        </ul>
      </article>

      <article class="detail-card" *ngIf="selectedQuote as q">
        <h2>Detail demande #{{ q.id }}</h2>
        <div class="detail-grid">
          <p><strong>Nom:</strong> {{ q.fullName }}</p>
          <p><strong>Email:</strong> {{ q.email }}</p>
          <p><strong>Telephone:</strong> {{ q.phone }}</p>
          <p><strong>Type evenement:</strong> {{ q.eventType }}</p>
          <p><strong>Budget:</strong> {{ q.estimatedBudget ?? 'N/A' }}</p>
          <p><strong>Date:</strong> {{ q.eventDate ?? 'N/A' }}</p>
        </div>
        <p class="details-block"><strong>Details:</strong> {{ q.details ?? '-' }}</p>

        <form [formGroup]="replyForm" (ngSubmit)="sendReply()">
          <h3>Repondre par email</h3>
          <label>
            Sujet
            <input type="text" formControlName="subject" />
          </label>
          <label>
            Message
            <textarea rows="8" formControlName="message"></textarea>
          </label>
          <button type="submit" [disabled]="isSubmittingReply">
            {{ isSubmittingReply ? 'Envoi en cours...' : 'Envoyer la reponse' }}
          </button>
        </form>
      </article>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .overline {
        margin: 0;
        text-transform: uppercase;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        color: var(--color-gold-dark);
        font-weight: 700;
      }

      .admin-header h1 {
        margin: 0.3rem 0 0;
        font-family: var(--font-display);
        color: var(--color-navy);
      }

      .logout-btn {
        border: 1px solid rgba(13, 27, 58, 0.2);
        border-radius: 10px;
        padding: 0.55rem 0.9rem;
        background: #fff;
        cursor: pointer;
        font-weight: 600;
      }

      .status {
        color: #1f7a45;
        font-weight: 600;
      }
      .error {
        color: #b42318;
        font-weight: 600;
      }

      .kpi-row {
        display: grid;
        gap: 0.9rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin: 1rem 0 1.1rem;
      }

      .kpi-card {
        background: #fff;
        border: 1px solid rgba(13, 27, 58, 0.08);
        border-radius: 12px;
        padding: 0.9rem 1rem;
      }

      .kpi-card p {
        margin: 0;
        color: var(--color-muted);
        font-size: 0.82rem;
      }

      .kpi-card strong {
        display: block;
        margin-top: 0.3rem;
        color: var(--color-navy);
        font-size: 1.3rem;
      }

      .content-grid {
        display: grid;
        gap: 1.1rem;
        grid-template-columns: 360px minmax(0, 1fr);
      }
      .list-card,
      .detail-card {
        border: 1px solid rgba(13, 27, 58, 0.1);
        border-radius: 12px;
        padding: 1.1rem;
        background: #fff;
        box-shadow: 0 10px 24px rgba(13, 27, 58, 0.06);
      }

      h2 {
        margin: 0;
        font-family: var(--font-display);
        color: var(--color-navy);
      }

      .muted {
        color: var(--color-muted);
      }
      ul {
        margin: 0.9rem 0 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }
      li {
        border: 1px solid rgba(13, 27, 58, 0.1);
        border-radius: 10px;
        padding: 0.75rem;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.22rem;
        transition: background 0.15s ease;
      }
      li.active {
        border-color: rgba(201, 162, 39, 0.65);
        background: #fffaec;
      }

      li:hover {
        background: #f9fbff;
      }

      .row-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .badge {
        font-size: 0.72rem;
        font-weight: 700;
        border-radius: 999px;
        padding: 0.2rem 0.45rem;
        background: #eef2f7;
        color: #2f3c56;
      }

      .badge-new {
        background: #fff3d1;
        color: #856404;
      }

      form {
        margin-top: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-grid {
        margin-top: 0.8rem;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.45rem 1rem;
      }

      .detail-grid p,
      .details-block {
        margin: 0;
        color: #1b253a;
      }

      .details-block {
        margin-top: 0.7rem;
        line-height: 1.55;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-navy);
        font-size: 0.9rem;
      }
      input,
      textarea {
        border: 1px solid rgba(13, 27, 58, 0.2);
        border-radius: 8px;
        padding: 0.65rem 0.75rem;
        font: inherit;
        background: #fbfcfe;
      }
      button[type='submit'] {
        border: 0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        background: var(--color-gold);
        color: var(--color-navy);
        font-weight: 700;
        cursor: pointer;
      }
      @media (max-width: 900px) {
        .admin-shell {
          grid-template-columns: 1fr;
        }

        .admin-sidebar {
          border-right: 0;
          border-bottom: 1px solid rgba(201, 162, 39, 0.2);
        }

        .kpi-row {
          grid-template-columns: 1fr;
        }

        .content-grid {
          grid-template-columns: 1fr;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
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

  readonly replyForm = this.fb.group({
    subject: ['Votre demande de devis - Adelyss Events', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.loadQuotes();
  }

  selectQuote(quote: AdminQuote): void {
    this.selectedQuote = quote;
    this.infoMessage = null;
    this.errorMessage = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }

  sendReply(): void {
    if (!this.selectedQuote) {
      return;
    }
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
        this.infoMessage = 'Reponse envoyee par email avec succes.';
        this.selectedQuote = updatedQuote;
        this.quotes = this.quotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
        this.replyForm.patchValue({ message: '' });
      },
      error: () => {
        this.isSubmittingReply = false;
        this.errorMessage = 'Echec envoi email. Verifiez la configuration SMTP.';
      },
    });
  }

  countByStatus(status: string): number {
    return this.quotes.filter((quote) => quote.status === status).length;
  }

  private loadQuotes(): void {
    this.quotesService.getQuotes().subscribe({
      next: (quotes) => {
        this.quotes = quotes;
        this.selectedQuote = quotes.length ? quotes[0] : null;
      },
      error: () => {
        this.errorMessage =
          "Impossible de charger l'espace admin. Reconnectez-vous ou verifiez le token.";
      },
    });
  }
}
