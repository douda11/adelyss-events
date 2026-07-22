import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminEvent, AdminEventService } from './admin-event.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Gestion des événements</p>
        <h1>Événements</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Ajouter un événement
      </button>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="grid-cards">
      <article class="event-card" *ngFor="let event of events">
        <div class="card-img" [style.backgroundImage]="'url(' + (event.imageUrl || '/assets/placeholder-event.jpg') + ')'">
          <span class="status-badge" [class.past]="event.status === 'PAST'">
            {{ event.status === 'PAST' ? 'Passé' : 'À venir' }}
          </span>
        </div>
        <div class="card-body">
          <h3>{{ event.title }}</h3>
          <p class="meta">
            <span>📅 {{ event.date | date:'shortDate' }}</span>
            <span>📍 {{ event.location }}</span>
          </p>
          <p class="desc">{{ event.description | slice:0:80 }}...</p>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" (click)="openForm(event)">✏️</button>
          <button class="icon-btn delete" (click)="deleteEvent(event.id)">🗑️</button>
        </div>
      </article>

      <div class="empty-state" *ngIf="!events.length && !isLoading">
        <p>Aucun événement trouvé.</p>
        <button class="secondary-btn" (click)="openForm()">Créer le premier événement</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un événement</h2>
        <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
          
          <div class="form-row">
            <label>
              Titre
              <input type="text" formControlName="title" placeholder="Ex: Soirée de Gala" />
            </label>
            <label>
              Date
              <input type="date" formControlName="date" />
            </label>
          </div>

          <label>
            Lieu
            <input type="text" formControlName="location" placeholder="Ex: Paris, France" />
          </label>

          <label>
            Description
            <textarea rows="4" formControlName="description"></textarea>
          </label>

          <div class="form-row">
            <label>
              Statut
              <select formControlName="status">
                <option value="UPCOMING">À venir</option>
                <option value="PAST">Passé</option>
              </select>
            </label>
            
            <label>
              Image (URL ou Upload)
              <div class="upload-group">
                <input type="text" formControlName="imageUrl" placeholder="https://..." />
                <button type="button" class="upload-btn" (click)="fileInput.click()">📁</button>
                <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*" />
              </div>
              <small *ngIf="uploading">Upload en cours...</small>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="eventForm.invalid || uploading">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.5rem;
      }
      .overline {
        margin: 0;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        color: #d4af37;
        font-weight: 700;
      }
      h1 {
        margin: 0.3rem 0 0;
        font-size: 2rem;
        color: #1e293b;
        font-family: 'Inter', sans-serif;
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
      .primary-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .secondary-btn {
        background: #fff;
        color: #1e293b;
        border: 1px solid #cbd5e1;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .secondary-btn:hover { background: #f8fafc; }
      .cancel-btn {
        background: transparent;
        color: #64748b;
        border: none;
        font-weight: 600;
        cursor: pointer;
      }
      
      .grid-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }
      .event-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      .event-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px rgba(0,0,0,0.06);
      }
      .card-img {
        height: 180px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .status-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: #10b981;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .status-badge.past {
        background: #64748b;
      }
      .card-body {
        padding: 1.5rem;
        flex: 1;
      }
      .card-body h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        color: #0f172a;
      }
      .meta {
        display: flex;
        gap: 1rem;
        font-size: 0.85rem;
        color: #64748b;
        margin-bottom: 1rem;
      }
      .desc {
        color: #475569;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
      }
      .card-actions {
        display: flex;
        border-top: 1px solid #f1f5f9;
        padding: 0.8rem 1.5rem;
        gap: 0.5rem;
        justify-content: flex-end;
        background: #f8fafc;
      }
      .icon-btn {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .icon-btn:hover { background: #f1f5f9; }
      .icon-btn.delete:hover { border-color: #ef4444; background: #fef2f2; }

      /* Modal styling */
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
        max-width: 600px;
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
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
      input, textarea, select {
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font: inherit;
        transition: border-color 0.2s;
        background: #fbfcfe;
      }
      input:focus, textarea:focus, select:focus {
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
      }
      .upload-btn:hover { background: #e2e8f0; }
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
export class AdminEventsComponent implements OnInit {
  private readonly eventService = inject(AdminEventService);
  private readonly fb = inject(FormBuilder);

  events: AdminEvent[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  uploading = false;
  currentEventId: number | null = null;

  eventForm = this.fb.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    location: [''],
    description: [''],
    imageUrl: [''],
    status: ['UPCOMING']
  });

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des événements.';
        this.isLoading = false;
      }
    });
  }

  openForm(event?: AdminEvent) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (event) {
      this.isEditing = true;
      this.currentEventId = event.id;
      this.eventForm.patchValue(event);
    } else {
      this.isEditing = false;
      this.currentEventId = null;
      this.eventForm.reset({ status: 'UPCOMING' });
    }
  }

  closeForm() {
    this.showForm = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      this.eventService.uploadImage(file).subscribe({
        next: (res) => {
          this.eventForm.patchValue({ imageUrl: res.url });
          this.uploading = false;
        },
        error: () => {
          this.errorMessage = "Erreur lors de l'upload de l'image.";
          this.uploading = false;
        }
      });
    }
  }

  saveEvent() {
    if (this.eventForm.invalid) return;

    const data = this.eventForm.value as Partial<AdminEvent>;
    if (this.isEditing && this.currentEventId) {
      this.eventService.updateEvent(this.currentEventId, data).subscribe({
        next: (updated) => {
          const idx = this.events.findIndex(e => e.id === updated.id);
          if (idx !== -1) this.events[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Événement mis à jour.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.eventService.createEvent(data).subscribe({
        next: (created) => {
          this.events.unshift(created);
          this.closeForm();
          this.infoMessage = 'Événement créé.';
        },
        error: () => this.errorMessage = 'Erreur lors de la création.'
      });
    }
  }

  deleteEvent(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== id);
          this.infoMessage = 'Événement supprimé.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
