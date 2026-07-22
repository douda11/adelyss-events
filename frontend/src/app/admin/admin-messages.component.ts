import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactMessage, AdminMessageService } from './admin-message.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Boîte de réception</p>
        <h1>Messages & Demandes</h1>
      </div>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="content-grid" *ngIf="messages">
      <article class="list-card">
        <h2>Inbox</h2>
        <p class="muted" *ngIf="!messages.length">Aucun message pour le moment.</p>
        <ul>
          <li
            *ngFor="let msg of messages"
            [class.active]="selectedMsg?.id === msg.id"
            [class.unread]="msg.status === 'NEW'"
            (click)="selectMsg(msg)"
          >
            <div class="row-top">
              <strong>{{ msg.name }}</strong>
              <span class="badge" [class.badge-new]="msg.status === 'NEW'">
                {{ getStatusLabel(msg.status) }}
              </span>
            </div>
            <span>Objet: {{ getSubjectLabel(msg.subject) }}</span>
            <small>{{ msg.createdAt | date: 'medium' }}</small>
          </li>
        </ul>
      </article>

      <article class="detail-card" *ngIf="selectedMsg as msg">
        <div class="detail-header">
          <h2>{{ getSubjectLabel(msg.subject) }}</h2>
          <div class="status-actions">
            <button (click)="updateStatus('READ')" [class.active]="msg.status === 'READ'" class="neutral">Lu</button>
            <button (click)="updateStatus('REPLIED')" [class.active]="msg.status === 'REPLIED'" class="success">Traité / Répondu</button>
            <button (click)="deleteMsg(msg.id)" class="danger"><i class="icon">🗑️</i> Supprimer</button>
          </div>
        </div>
        
        <div class="detail-grid">
          <p><strong>De:</strong> {{ msg.name }}</p>
          <p><strong>Email:</strong> <a [href]="'mailto:' + msg.email">{{ msg.email }}</a></p>
          <p><strong>Téléphone:</strong> {{ msg.phone || 'Non renseigné' }}</p>
          <p><strong>Date:</strong> {{ msg.createdAt | date: 'longDate' }} à {{ msg.createdAt | date: 'shortTime' }}</p>
        </div>
        
        <div class="message-block">
          <h3>Contenu du message</h3>
          <p>{{ msg.message }}</p>
        </div>

        <div class="reply-block" *ngIf="msg.status !== 'REPLIED'">
          <h3>Répondre au message</h3>
          <textarea [(ngModel)]="replyText" rows="4" placeholder="Tapez votre réponse ici..."></textarea>
          <button (click)="sendReply()" [disabled]="!replyText" class="btn-gold">Envoyer la réponse</button>
        </div>
        <div class="reply-block success" *ngIf="msg.status === 'REPLIED'">
          <h3>Répondu</h3>
          <p>Vous avez déjà répondu à ce message.</p>
        </div>
      </article>

      <article class="detail-card empty-detail" *ngIf="!selectedMsg && messages.length > 0">
        <p>Sélectionnez un message dans la liste pour le lire.</p>
      </article>
    </div>
  `,
  styles: [
    `
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }
      
      .content-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start; }
      @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
      
      .list-card, .detail-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
      .list-card h2 { margin: 0 0 1.5rem; font-size: 1.2rem; }
      .list-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; height: 600px; overflow-y: auto; }
      .list-card li { padding: 1rem; border: 1px solid #f1f5f9; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
      .list-card li:hover { background: #f8fafc; }
      .list-card li.active { border-color: #d4af37; background: rgba(212, 175, 55, 0.05); }
      .list-card li.unread strong { color: #0f172a; font-weight: 800; }
      
      .row-top { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
      .list-card span { display: block; color: #475569; font-size: 0.9rem; margin-bottom: 0.3rem; }
      .list-card small { color: #94a3b8; font-size: 0.8rem; }
      
      .badge { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #e2e8f0; color: #64748b; }
      .badge-new { background: #3b82f6; color: white; }

      .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
      .detail-header h2 { margin: 0; color: #0f172a; font-size: 1.4rem; }
      .status-actions { display: flex; gap: 0.5rem; }
      .status-actions button { background: white; border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 0.3rem; }
      .status-actions button:hover { background: #f1f5f9; }
      .status-actions button.active { background: #e2e8f0; border-color: #94a3b8; }
      .status-actions button.success.active { background: #10b981; color: white; border-color: #10b981; }
      .status-actions button.danger { color: #ef4444; border-color: #ef4444; }
      .status-actions button.danger:hover { background: #fef2f2; }

      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f8fafc; padding: 1rem; border-radius: 8px; }
      .detail-grid p { margin: 0; color: #334155; font-size: 0.95rem; }
      .detail-grid a { color: #3b82f6; text-decoration: none; }
      .detail-grid a:hover { text-decoration: underline; }
      
      .message-block { padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
      .message-block h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #1e293b; }
      .message-block p { margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap; font-size: 1.05rem; }

      .empty-detail { display: grid; place-items: center; color: #94a3b8; font-style: italic; min-height: 300px; }

      .reply-block { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
      .reply-block h3 { margin: 0 0 0.8rem; font-size: 1.05rem; }
      .reply-block textarea { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; margin-bottom: 0.8rem; resize: vertical; }
      .reply-block .btn-gold { background: #d4af37; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
      .reply-block .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
      .reply-block.success p { color: #10b981; font-weight: 600; }

      .status { color: #10b981; font-weight: 600; }
      .error { color: #ef4444; font-weight: 600; }
    `
  ]
})
export class AdminMessagesComponent implements OnInit {
  private readonly messageService = inject(AdminMessageService);

  messages: ContactMessage[] = [];
  selectedMsg: ContactMessage | null = null;
  infoMessage = '';
  errorMessage = '';
  replyText = '';

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages().subscribe({
      next: (data) => this.messages = data,
      error: () => this.errorMessage = 'Erreur lors du chargement des messages.'
    });
  }

  selectMsg(msg: ContactMessage) {
    this.selectedMsg = msg;
    this.replyText = '';
    if (msg.status === 'NEW') {
      this.updateStatus('READ', false);
    }
  }

  updateStatus(status: string, notify = true) {
    if (!this.selectedMsg) return;
    
    this.messageService.updateStatus(this.selectedMsg.id, status).subscribe({
      next: (updated) => {
        this.selectedMsg!.status = updated.status;
        const idx = this.messages.findIndex(m => m.id === updated.id);
        if (idx !== -1) this.messages[idx] = updated;
        if (notify) this.infoMessage = 'Statut mis à jour.';
      },
      error: () => {
        if (notify) this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  sendReply() {
    if (!this.selectedMsg || !this.replyText.trim()) return;

    this.messageService.replyToMessage(this.selectedMsg.id, this.replyText).subscribe({
      next: (updated) => {
        this.selectedMsg!.status = updated.status;
        const idx = this.messages.findIndex(m => m.id === updated.id);
        if (idx !== -1) this.messages[idx] = updated;
        this.replyText = '';
        this.infoMessage = 'Réponse envoyée par email avec succès.';
      },
      error: () => this.errorMessage = 'Erreur lors de l\'envoi de la réponse.'
    });
  }

  deleteMsg(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
      this.messageService.deleteMessage(id).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== id);
          if (this.selectedMsg?.id === id) this.selectedMsg = null;
          this.infoMessage = 'Message supprimé.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }

  getSubjectLabel(subject: string): string {
    const labels: Record<string, string> = {
      'contact': 'Message général',
      'devis': 'Demande de devis',
      'recrutement': 'Question recrutement',
      'partenariat': 'Proposition de partenariat / sponsoring'
    };
    return labels[subject] || subject;
  }

  getStatusLabel(status: string): string {
    if (status === 'NEW') return 'Nouveau';
    if (status === 'READ') return 'Lu';
    if (status === 'REPLIED') return 'Traité';
    return status;
  }
}
