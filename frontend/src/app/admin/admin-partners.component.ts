import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Partner, AdminPartnerService } from './admin-partner.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Réseau</p>
        <h1>Partenaires & Sponsors</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Ajouter
      </button>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="grid-cards">
      <article class="partner-card" *ngFor="let partner of partners">
        <div class="card-img" [style.backgroundImage]="'url(' + (partner.logoUrl || '/assets/placeholder-logo.jpg') + ')'">
          <span class="type-badge" [class.sponsor]="partner.type === 'SPONSOR'">
            {{ partner.type === 'SPONSOR' ? 'Sponsor' : 'Partenaire' }}
          </span>
        </div>
        <div class="card-body">
          <h3>{{ partner.name }}</h3>
          <a [href]="partner.websiteUrl" target="_blank" class="website-link" *ngIf="partner.websiteUrl">🌐 Visiter le site</a>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" (click)="openForm(partner)">✏️</button>
          <button class="icon-btn delete" (click)="deletePartner(partner.id)">🗑️</button>
        </div>
      </article>

      <div class="empty-state" *ngIf="!partners.length && !isLoading">
        <p>Aucun partenaire trouvé.</p>
        <button class="secondary-btn" (click)="openForm()">Ajouter le premier</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un partenaire</h2>
        <form [formGroup]="partnerForm" (ngSubmit)="savePartner()">
          
          <div class="form-row">
            <label>
              Nom de l'entreprise
              <input type="text" formControlName="name" />
            </label>
            <label>
              Type
              <select formControlName="type">
                <option value="PARTNER">Partenaire (Traiteur, Logistique...)</option>
                <option value="SPONSOR">Sponsor (Financement)</option>
              </select>
            </label>
          </div>

          <label>
            Site web (URL)
            <input type="url" formControlName="websiteUrl" placeholder="https://..." />
          </label>

          <label>
            Logo (URL ou Upload)
            <div class="upload-group">
              <input type="text" formControlName="logoUrl" placeholder="https://..." />
              <button type="button" class="upload-btn" (click)="fileInput.click()">📁</button>
              <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*" />
            </div>
            <small *ngIf="uploading">Upload en cours...</small>
          </label>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="partnerForm.invalid || uploading">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }
      .primary-btn { background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%); color: #fff; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
      .secondary-btn { background: #fff; color: #1e293b; border: 1px solid #cbd5e1; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
      
      .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
      .partner-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); text-align: center; }
      .card-img { height: 140px; background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #f8fafc; position: relative; padding: 1rem; border-bottom: 1px solid #f1f5f9; }
      .type-badge { position: absolute; top: 0.5rem; right: 0.5rem; background: #3b82f6; color: white; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
      .type-badge.sponsor { background: #d4af37; color: #fff; }
      .card-body { padding: 1.5rem; }
      .card-body h3 { margin: 0 0 0.5rem; color: #0f172a; }
      .website-link { color: #3b82f6; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
      .website-link:hover { text-decoration: underline; }
      
      .card-actions { display: flex; justify-content: center; border-top: 1px solid #f1f5f9; padding: 0.8rem; gap: 0.5rem; background: #f8fafc; }
      .icon-btn { background: white; border: 1px solid #e2e8f0; border-radius: 8px; width: 36px; height: 36px; cursor: pointer; }
      .icon-btn:hover { background: #f1f5f9; }
      .icon-btn.delete:hover { border-color: #ef4444; background: #fef2f2; }

      /* Modal styling */
      .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 100; padding: 1rem; }
      .modal-content { background: #fff; width: 100%; max-width: 500px; border-radius: 16px; padding: 2.5rem; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; }
      form { display: flex; flex-direction: column; gap: 1.2rem; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
      input, select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
      input:focus, select:focus { outline: none; border-color: #d4af37; }
      .upload-group { display: flex; gap: 0.5rem; }
      .upload-group input { flex: 1; }
      .upload-btn { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 1rem; cursor: pointer; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
      .cancel-btn { background: transparent; border: none; font-weight: 600; color: #64748b; cursor: pointer; }
      
      .status { color: #10b981; font-weight: 600; margin-bottom: 1rem; }
      .error { color: #ef4444; font-weight: 600; margin-bottom: 1rem; }
      .empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b; }
    `
  ]
})
export class AdminPartnersComponent implements OnInit {
  private readonly partnerService = inject(AdminPartnerService);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient); // for upload

  partners: Partner[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  uploading = false;
  currentPartnerId: number | null = null;

  partnerForm = this.fb.group({
    name: ['', Validators.required],
    type: ['PARTNER'],
    websiteUrl: [''],
    logoUrl: ['']
  });

  ngOnInit() {
    this.loadPartners();
  }

  loadPartners() {
    this.partnerService.getPartners().subscribe({
      next: (data) => { this.partners = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Erreur lors du chargement.'; this.isLoading = false; }
    });
  }

  openForm(partner?: Partner) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (partner) {
      this.isEditing = true;
      this.currentPartnerId = partner.id;
      this.partnerForm.patchValue(partner);
    } else {
      this.isEditing = false;
      this.currentPartnerId = null;
      this.partnerForm.reset({ type: 'PARTNER' });
    }
  }

  closeForm() { this.showForm = false; }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('adelyss_admin_token') || '';
      this.http.post<{url: string}>('/api/admin/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          this.partnerForm.patchValue({ logoUrl: res.url });
          this.uploading = false;
        },
        error: () => {
          this.errorMessage = "Erreur lors de l'upload de l'image.";
          this.uploading = false;
        }
      });
    }
  }

  savePartner() {
    if (this.partnerForm.invalid) return;
    const data = this.partnerForm.value as Partial<Partner>;
    
    if (this.isEditing && this.currentPartnerId) {
      this.partnerService.updatePartner(this.currentPartnerId, data).subscribe({
        next: (updated) => {
          const idx = this.partners.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.partners[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Partenaire mis à jour.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.partnerService.createPartner(data).subscribe({
        next: (created) => {
          this.partners.unshift(created);
          this.closeForm();
          this.infoMessage = 'Partenaire ajouté.';
        },
        error: () => this.errorMessage = 'Erreur lors de la création.'
      });
    }
  }

  deletePartner(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce partenaire ?')) {
      this.partnerService.deletePartner(id).subscribe({
        next: () => {
          this.partners = this.partners.filter(p => p.id !== id);
          this.infoMessage = 'Partenaire supprimé.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
