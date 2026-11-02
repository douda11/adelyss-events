import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminAuthService } from './admin-auth.service';

export interface AdminClient {
  id: number;
  name: string;
  type: string;
  logoUrl: string;
  websiteUrl?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Références & Partenaires</p>
        <h1>⭐ Ils nous font confiance (Clients)</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Ajouter un client
      </button>
    </div>

    <p class="section-notice">
      💡 Les logos ajoutés ici s'affichent automatiquement sur votre site public dans la rubrique <strong>« Ils nous font confiance »</strong>.
    </p>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="grid-cards">
      <article class="client-card" *ngFor="let client of clients">
        <div class="card-logo-box">
          <img *ngIf="client.logoUrl" [src]="client.logoUrl" [alt]="client.name" class="client-logo-img" />
          <div *ngIf="!client.logoUrl" class="client-logo-placeholder">🏢 Pas de logo</div>
        </div>
        <div class="card-body">
          <h3>{{ client.name }}</h3>
          <a [href]="client.websiteUrl" target="_blank" class="website-link" *ngIf="client.websiteUrl">
            🌐 {{ client.websiteUrl }}
          </a>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" (click)="openForm(client)" title="Modifier">✏️</button>
          <button class="icon-btn delete" (click)="deleteClient(client.id)" title="Supprimer">🗑️</button>
        </div>
      </article>

      <div class="empty-state" *ngIf="!clients.length && !isLoading">
        <p>Aucun logo client pour le moment.</p>
        <button class="secondary-btn" (click)="openForm()">Ajouter le premier logo client</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un logo client</h2>
        <form [formGroup]="clientForm" (ngSubmit)="saveClient()">
          
          <label>
            Nom du client / Entreprise
            <input type="text" formControlName="name" placeholder="Ex: Groupe Poulina, Orange, BIAT..." />
          </label>

          <label>
            Site web de l'entreprise (Optionnel)
            <input type="url" formControlName="websiteUrl" placeholder="https://www.exemple.com" />
          </label>

          <label>
            Logo de l'entreprise (Fichier ou URL)
            <div class="upload-group">
              <input type="text" formControlName="logoUrl" placeholder="https://... ou cliquez sur 📁" />
              <button type="button" class="upload-btn" (click)="fileInput.click()" title="Choisir un logo">📁 Parcourir</button>
              <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*" />
            </div>
            <div *ngIf="clientForm.value.logoUrl" class="logo-preview-box">
              <img [src]="clientForm.value.logoUrl" alt="Aperçu du logo" class="preview-logo" />
              <span>✓ Logo sélectionné</span>
            </div>
            <small *ngIf="uploading" class="status">⏳ Envoi du logo en cours...</small>
          </label>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="clientForm.invalid || uploading">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; letter-spacing: 0.1em; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; font-family: 'Inter', sans-serif; }
      .section-notice {
        background: #fdf6e2;
        border-left: 4px solid #d4af37;
        padding: 0.8rem 1.2rem;
        border-radius: 0 8px 8px 0;
        color: #78350f;
        font-size: 0.95rem;
        margin-bottom: 2rem;
      }
      .primary-btn {
        background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%);
        color: #fff;
        border: none;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .primary-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
      }
      .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .secondary-btn {
        background: #fff;
        color: #1e293b;
        border: 1px solid #cbd5e1;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .cancel-btn {
        background: transparent;
        color: #64748b;
        border: none;
        font-weight: 600;
        cursor: pointer;
      }
      .grid-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
      }
      .client-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
      }
      .client-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px rgba(0,0,0,0.06);
      }
      .card-logo-box {
        height: 140px;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        border-bottom: 1px solid #f1f5f9;
      }
      .client-logo-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .client-logo-placeholder {
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .card-body {
        padding: 1.2rem;
        flex: 1;
        text-align: center;
      }
      .card-body h3 {
        margin: 0 0 0.4rem;
        font-size: 1.15rem;
        color: #0f172a;
      }
      .website-link {
        font-size: 0.85rem;
        color: #d4af37;
        text-decoration: none;
        word-break: break-all;
      }
      .website-link:hover { text-decoration: underline; }
      .card-actions {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        border-top: 1px solid #f1f5f9;
        padding: 0.8rem;
      }
      .icon-btn {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        cursor: pointer;
      }
      .icon-btn:hover { background: #f1f5f9; }
      .icon-btn.delete:hover { border-color: #ef4444; background: #fef2f2; }
      
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        z-index: 100;
        padding: 1rem;
      }
      .modal-content {
        background: #fff;
        width: 100%;
        max-width: 500px;
        border-radius: 16px;
        padding: 2.5rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: #0f172a; }
      form { display: flex; flex-direction: column; gap: 1.2rem; }
      label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
      input {
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font: inherit;
        background: #fbfcfe;
      }
      input:focus {
        outline: none;
        border-color: #d4af37;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      }
      .upload-group { display: flex; gap: 0.5rem; }
      .upload-group input { flex: 1; }
      .upload-btn {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0 1rem;
        cursor: pointer;
        font-weight: 600;
        color: #334155;
      }
      .logo-preview-box {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: #f8fafc;
        border: 1px dashed #d4af37;
        padding: 0.8rem;
        border-radius: 8px;
        margin-top: 0.5rem;
      }
      .preview-logo {
        height: 50px;
        max-width: 120px;
        object-fit: contain;
        background: #fff;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      .logo-preview-box span {
        font-size: 0.85rem;
        color: #10b981;
        font-weight: 600;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid #f1f5f9;
      }
      .status { color: #10b981; font-weight: 600; margin-bottom: 1rem; }
      .error { color: #ef4444; font-weight: 600; margin-bottom: 1rem; }
      .empty-state { text-align: center; padding: 4rem 1rem; grid-column: 1 / -1; color: #64748b; }
    `
  ]
})
export class AdminClientsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);
  private readonly fb = inject(FormBuilder);

  clients: AdminClient[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  uploading = false;
  currentClientId: number | null = null;

  clientForm = this.fb.group({
    name: ['', Validators.required],
    websiteUrl: [''],
    logoUrl: ['', Validators.required],
    type: ['CLIENT']
  });

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.http.get<AdminClient[]>('/api/admin/partners', { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        // Filtrer uniquement les clients (type === 'CLIENT')
        this.clients = data.filter(p => p.type === 'CLIENT');
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Erreur lors du chargement des clients.";
        this.isLoading = false;
      }
    });
  }

  openForm(client?: AdminClient) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (client) {
      this.isEditing = true;
      this.currentClientId = client.id;
      this.clientForm.patchValue({
        name: client.name,
        websiteUrl: client.websiteUrl || '',
        logoUrl: client.logoUrl,
        type: 'CLIENT'
      });
    } else {
      this.isEditing = false;
      this.currentClientId = null;
      this.clientForm.reset({ type: 'CLIENT' });
    }
  }

  closeForm() {
    this.showForm = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<{url: string}>('/api/admin/upload', formData, { headers: this.authHeaders() }).subscribe({
        next: (res) => {
          this.clientForm.patchValue({ logoUrl: res.url });
          this.uploading = false;
        },
        error: () => {
          this.errorMessage = "Erreur lors de l'upload du logo.";
          this.uploading = false;
        }
      });
    }
  }

  saveClient() {
    if (this.clientForm.invalid) return;

    const data = {
      ...this.clientForm.value,
      type: 'CLIENT'
    };

    if (this.isEditing && this.currentClientId) {
      this.http.put<AdminClient>(`/api/admin/partners/${this.currentClientId}`, data, { headers: this.authHeaders() }).subscribe({
        next: (updated) => {
          const idx = this.clients.findIndex(c => c.id === updated.id);
          if (idx !== -1) this.clients[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Client mis à jour.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.http.post<AdminClient>('/api/admin/partners', data, { headers: this.authHeaders() }).subscribe({
        next: (created) => {
          this.clients.push(created);
          this.closeForm();
          this.infoMessage = 'Client et logo ajoutés avec succès.';
        },
        error: () => this.errorMessage = "Erreur lors de l'enregistrement."
      });
    }
  }

  deleteClient(id: number) {
    if (confirm('Voulez-vous vraiment retirer ce logo client ?')) {
      this.http.delete<void>(`/api/admin/partners/${id}`, { headers: this.authHeaders() }).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.id !== id);
          this.infoMessage = 'Logo client retiré.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
