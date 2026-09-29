import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceOffer, AdminServiceOfferService } from './admin-service-offer.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Gestion du site</p>
        <h1>Prestations & Services</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Ajouter une prestation
      </button>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="grid-cards">
      <article class="service-card" *ngFor="let service of services; let i = index"
               [class.inactive]="!service.active">
        <div class="card-header">
          <span class="service-icon">{{ service.icon || '🛎️' }}</span>
          <span class="order-badge">#{{ service.displayOrder }}</span>
          <span class="active-badge" [class.off]="!service.active">
            {{ service.active ? 'Visible' : 'Masqué' }}
          </span>
        </div>
        <div class="card-body">
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" (click)="openForm(service)" title="Modifier">✏️</button>
          <button class="icon-btn toggle" (click)="toggleActive(service)" 
                  [title]="service.active ? 'Masquer' : 'Afficher'">
            {{ service.active ? '👁️' : '🙈' }}
          </button>
          <button class="icon-btn delete" (click)="deleteService(service.id)" title="Supprimer">🗑️</button>
        </div>
      </article>

      <div class="empty-state" *ngIf="!services.length && !isLoading">
        <p>Aucune prestation trouvée.</p>
        <button class="secondary-btn" (click)="openForm()">Ajouter la première</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} une prestation</h2>
        <form [formGroup]="serviceForm" (ngSubmit)="saveService()">
          
          <label>
            Titre de la prestation *
            <input type="text" formControlName="title" placeholder="Ex: Organisation de Mariages" />
          </label>

          <label>
            Description détaillée *
            <textarea formControlName="description" rows="4" 
                      placeholder="Décrivez votre prestation en détail..."></textarea>
          </label>

          <div class="form-row">
            <label>
              Icône / Emoji
              <div class="emoji-input">
                <input type="text" formControlName="icon" placeholder="🎤" maxlength="4" />
                <div class="emoji-suggestions">
                  <button type="button" *ngFor="let e of emojis" (click)="setIcon(e)">{{ e }}</button>
                </div>
              </div>
            </label>
            <label>
              Ordre d'affichage
              <input type="number" formControlName="displayOrder" min="0" />
            </label>
          </div>

          <label class="checkbox-label">
            <input type="checkbox" formControlName="active" />
            Visible sur la page d'accueil
          </label>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="serviceForm.invalid">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .overline { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: #d4af37; font-weight: 700; letter-spacing: 1px; }
    h1 { margin: 0.3rem 0 0; font-size: 2rem; color: #1e293b; }
    .primary-btn { background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%); color: #fff; border: none; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
    .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .secondary-btn { background: #fff; color: #1e293b; border: 1px solid #cbd5e1; padding: 0.8rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

    .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

    .service-card {
      background: #fff; border-radius: 12px; overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .service-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .service-card.inactive { opacity: 0.6; border-style: dashed; }

    .card-header {
      display: flex; align-items: center; gap: 0.8rem;
      padding: 1.2rem 1.5rem; background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-bottom: 1px solid #e2e8f0;
    }
    .service-icon { font-size: 2rem; }
    .order-badge {
      background: #e2e8f0; color: #475569; padding: 0.15rem 0.5rem;
      border-radius: 6px; font-size: 0.75rem; font-weight: 700;
    }
    .active-badge {
      margin-left: auto; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      padding: 0.2rem 0.6rem; border-radius: 999px;
      background: #dcfce7; color: #16a34a;
    }
    .active-badge.off { background: #fef2f2; color: #dc2626; }

    .card-body { padding: 1.5rem; }
    .card-body h3 { margin: 0 0 0.5rem; color: #0f172a; font-size: 1.1rem; }
    .card-body p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.5; }

    .card-actions {
      display: flex; justify-content: center; border-top: 1px solid #f1f5f9;
      padding: 0.8rem; gap: 0.5rem; background: #f8fafc;
    }
    .icon-btn {
      background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      width: 36px; height: 36px; cursor: pointer; font-size: 1rem;
      display: grid; place-items: center; transition: all 0.15s;
    }
    .icon-btn:hover { background: #f1f5f9; }
    .icon-btn.delete:hover { border-color: #ef4444; background: #fef2f2; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 100; padding: 1rem;
    }
    .modal-content {
      background: #fff; width: 100%; max-width: 560px; border-radius: 16px; padding: 2.5rem;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: #0f172a; }
    form { display: flex; flex-direction: column; gap: 1.2rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
    label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
    input, select, textarea { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; resize: vertical; }
    input:focus, textarea:focus { outline: none; border-color: #d4af37; }
    
    .emoji-input { display: flex; flex-direction: column; gap: 0.4rem; }
    .emoji-input input { width: 80px; text-align: center; font-size: 1.5rem; }
    .emoji-suggestions { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .emoji-suggestions button {
      background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px;
      padding: 0.3rem 0.5rem; cursor: pointer; font-size: 1.1rem;
      transition: all 0.15s;
    }
    .emoji-suggestions button:hover { background: #e2e8f0; transform: scale(1.15); }

    .checkbox-label { flex-direction: row !important; align-items: center; gap: 0.6rem !important; }
    .checkbox-label input { width: auto; }

    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .cancel-btn { background: transparent; border: none; font-weight: 600; color: #64748b; cursor: pointer; }

    .status { color: #10b981; font-weight: 600; margin-bottom: 1rem; }
    .error { color: #ef4444; font-weight: 600; margin-bottom: 1rem; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b; }
  `]
})
export class AdminServicesComponent implements OnInit {
  private readonly serviceService = inject(AdminServiceOfferService);
  private readonly fb = inject(FormBuilder);

  services: ServiceOffer[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  currentServiceId: number | null = null;

  emojis = ['🏢', '💍', '✨', '🎤', '🎶', '📸', '🍽️', '🎭', '🌺', '💡', '🎪', '🏆'];

  serviceForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    icon: ['🛎️'],
    displayOrder: [0],
    active: [true]
  });

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => { this.services = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Erreur lors du chargement.'; this.isLoading = false; }
    });
  }

  openForm(service?: ServiceOffer) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (service) {
      this.isEditing = true;
      this.currentServiceId = service.id;
      this.serviceForm.patchValue(service);
    } else {
      this.isEditing = false;
      this.currentServiceId = null;
      this.serviceForm.reset({ icon: '🛎️', displayOrder: this.services.length + 1, active: true });
    }
  }

  closeForm() { this.showForm = false; }

  setIcon(emoji: string) {
    this.serviceForm.patchValue({ icon: emoji });
  }

  saveService() {
    if (this.serviceForm.invalid) return;
    const data = this.serviceForm.value as Partial<ServiceOffer>;

    if (this.isEditing && this.currentServiceId) {
      this.serviceService.updateService(this.currentServiceId, data).subscribe({
        next: (updated) => {
          const idx = this.services.findIndex(s => s.id === updated.id);
          if (idx !== -1) this.services[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Prestation mise à jour avec succès.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.serviceService.createService(data).subscribe({
        next: (created) => {
          this.services.push(created);
          this.closeForm();
          this.infoMessage = 'Prestation ajoutée avec succès.';
        },
        error: () => this.errorMessage = "Erreur lors de la création."
      });
    }
  }

  toggleActive(service: ServiceOffer) {
    const updated = { ...service, active: !service.active };
    this.serviceService.updateService(service.id, updated).subscribe({
      next: (result) => {
        const idx = this.services.findIndex(s => s.id === result.id);
        if (idx !== -1) this.services[idx] = result;
        this.infoMessage = result.active ? 'Prestation visible sur le site.' : 'Prestation masquée du site.';
      },
      error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
    });
  }

  deleteService(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette prestation ?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          this.services = this.services.filter(s => s.id !== id);
          this.infoMessage = 'Prestation supprimée.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
