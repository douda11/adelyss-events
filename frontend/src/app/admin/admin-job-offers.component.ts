import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobOffer, AdminRecruitmentService } from './admin-recruitment.service';

@Component({
  selector: 'app-admin-job-offers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Recrutement</p>
        <h1>Offres d'emploi</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Nouvelle offre
      </button>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="list-card">
      <div class="empty-state" *ngIf="!offers.length && !isLoading">
        <p>Aucune offre d'emploi.</p>
        <button class="secondary-btn" (click)="openForm()">Créer une offre</button>
      </div>

      <ul class="offer-list" *ngIf="offers.length">
        <li class="offer-item" *ngFor="let offer of offers">
          <div class="offer-info">
            <h3>{{ offer.title }}</h3>
            <p class="meta">
              <span class="badge" [class.badge-active]="offer.active">{{ offer.active ? 'Active' : 'Brouillon' }}</span>
              <span>📍 {{ offer.location || 'Non spécifié' }}</span>
              <span>💼 {{ offer.type || 'Non spécifié' }}</span>
            </p>
            <p class="desc">{{ offer.description | slice:0:150 }}...</p>
          </div>
          <div class="offer-actions">
            <button class="icon-btn edit" (click)="openForm(offer)">✏️</button>
            <button class="icon-btn delete" (click)="deleteOffer(offer.id)">🗑️</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} une offre</h2>
        <form [formGroup]="offerForm" (ngSubmit)="saveOffer()">
          
          <label>
            Titre du poste
            <input type="text" formControlName="title" placeholder="Ex: Chef de projet événementiel" />
          </label>

          <div class="form-row">
            <label>
              Lieu
              <input type="text" formControlName="location" placeholder="Ex: Tunis / Hybride" />
            </label>
            <label>
              Type de contrat
              <input type="text" formControlName="type" placeholder="Ex: CDI, Stage..." />
            </label>
          </div>

          <label>
            Description et missions
            <textarea rows="5" formControlName="description"></textarea>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" formControlName="active" />
            Publier cette offre (Visible en ligne)
          </label>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="offerForm.invalid">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
      .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; }
      h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }
      .primary-btn { background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%); color: #fff; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
      .secondary-btn { background: #fff; color: #1e293b; border: 1px solid #cbd5e1; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
      .icon-btn { background: white; border: 1px solid #e2e8f0; border-radius: 8px; width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer; }
      .icon-btn:hover { background: #f1f5f9; }
      .icon-btn.delete:hover { border-color: #ef4444; background: #fef2f2; }
      
      .list-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
      .offer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
      .offer-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; border: 1px solid #f1f5f9; border-radius: 12px; transition: background 0.2s; }
      .offer-item:hover { background: #f8fafc; }
      .offer-info h3 { margin: 0 0 0.5rem; color: #0f172a; font-size: 1.2rem; }
      .meta { display: flex; gap: 1rem; align-items: center; font-size: 0.85rem; color: #64748b; margin-bottom: 0.8rem; }
      .badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; background: #e2e8f0; color: #64748b; }
      .badge-active { background: #10b981; color: white; }
      .desc { margin: 0; color: #475569; font-size: 0.95rem; }
      .offer-actions { display: flex; gap: 0.5rem; }

      .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 100; padding: 1rem; }
      .modal-content { background: #fff; width: 100%; max-width: 600px; border-radius: 16px; padding: 2.5rem; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; }
      form { display: flex; flex-direction: column; gap: 1.2rem; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
      .checkbox-label { flex-direction: row; align-items: center; cursor: pointer; padding-top: 1rem; }
      input, textarea { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
      input:focus, textarea:focus { outline: none; border-color: #d4af37; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
      .cancel-btn { background: transparent; border: none; font-weight: 600; color: #64748b; cursor: pointer; }
      .status { color: #10b981; font-weight: 600; }
      .error { color: #ef4444; font-weight: 600; }
      .empty-state { text-align: center; padding: 2rem; color: #64748b; }
    `
  ]
})
export class AdminJobOffersComponent implements OnInit {
  private readonly recruitmentService = inject(AdminRecruitmentService);
  private readonly fb = inject(FormBuilder);

  offers: JobOffer[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  currentOfferId: number | null = null;

  offerForm = this.fb.group({
    title: ['', Validators.required],
    location: [''],
    type: [''],
    description: [''],
    active: [true]
  });

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.recruitmentService.getJobOffers().subscribe({
      next: (data) => { this.offers = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Erreur lors du chargement des offres.'; this.isLoading = false; }
    });
  }

  openForm(offer?: JobOffer) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (offer) {
      this.isEditing = true;
      this.currentOfferId = offer.id;
      this.offerForm.patchValue(offer);
    } else {
      this.isEditing = false;
      this.currentOfferId = null;
      this.offerForm.reset({ active: true });
    }
  }

  closeForm() { this.showForm = false; }

  saveOffer() {
    if (this.offerForm.invalid) return;
    const data = this.offerForm.value as Partial<JobOffer>;
    
    if (this.isEditing && this.currentOfferId) {
      this.recruitmentService.updateJobOffer(this.currentOfferId, data).subscribe({
        next: (updated) => {
          const idx = this.offers.findIndex(o => o.id === updated.id);
          if (idx !== -1) this.offers[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Offre mise à jour.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.recruitmentService.createJobOffer(data).subscribe({
        next: (created) => {
          this.offers.unshift(created);
          this.closeForm();
          this.infoMessage = 'Offre créée.';
        },
        error: () => this.errorMessage = 'Erreur lors de la création.'
      });
    }
  }

  deleteOffer(id: number) {
    if (confirm('Supprimer cette offre ?')) {
      this.recruitmentService.deleteJobOffer(id).subscribe({
        next: () => {
          this.offers = this.offers.filter(o => o.id !== id);
          this.infoMessage = 'Offre supprimée.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
