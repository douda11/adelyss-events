import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminTeamMember, AdminTeamService } from './admin-team.service';
import { compressImageFile } from './image-compressor.util';

@Component({
  selector: 'app-admin-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <p class="overline">Gestion du personnel</p>
        <h1>Équipe Adelyss</h1>
      </div>
      <button class="primary-btn" (click)="openForm()">
        <i class="icon">+</i> Ajouter un membre
      </button>
    </div>

    <p class="status" *ngIf="infoMessage">{{ infoMessage }}</p>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

    <div class="team-grid">
      <article class="team-card" *ngFor="let member of team">
        <div class="card-avatar">
          <img *ngIf="member.imageUrl" [src]="member.imageUrl" [alt]="member.firstName" class="avatar-img" />
          <div *ngIf="!member.imageUrl" class="avatar-initials">
            {{ member.firstName.charAt(0) || 'A' }}{{ member.lastName.charAt(0) || 'E' }}
          </div>

          <span class="active-dot" [class.inactive]="!member.active"></span>
        </div>
        <div class="card-body">
          <h3>{{ member.firstName }} {{ member.lastName }}</h3>
          <p class="role">{{ member.role }}</p>
          <div class="bio">{{ member.bio || 'Aucune biographie.' }}</div>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" (click)="openForm(member)" title="Modifier">✏️</button>
          <button class="icon-btn delete" (click)="deleteMember(member.id)" title="Supprimer">🗑️</button>
        </div>
      </article>

      <div class="empty-state" *ngIf="!team.length && !isLoading">
        <p>L'équipe est vide.</p>
        <button class="secondary-btn" (click)="openForm()">Ajouter le premier membre</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" *ngIf="showForm">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un membre</h2>
        <form [formGroup]="teamForm" (ngSubmit)="saveMember()">
          
          <div class="form-row">
            <label>
              Prénom
              <input type="text" formControlName="firstName" />
            </label>
            <label>
              Nom
              <input type="text" formControlName="lastName" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Rôle / Poste
              <input type="text" formControlName="role" placeholder="Ex: Fondatrice & CEO" />
            </label>
            <label class="checkbox-label">
              <input type="checkbox" formControlName="active" />
              Membre actif
            </label>
          </div>

          <label>
            Biographie / Présentation
            <textarea rows="5" formControlName="bio" placeholder="Présentation du membre (sauter des lignes pour aérer le texte)..."></textarea>
          </label>

          <label>
            Photo de profil (Fichier ou URL)
            <div class="upload-group">
              <input type="text" formControlName="imageUrl" placeholder="https://... ou cliquez sur 📁" />
              <button type="button" class="upload-btn" (click)="fileInput.click()" title="Choisir une photo depuis mon appareil">📁 Parcourir</button>
              <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*" />
            </div>
            <div *ngIf="teamForm.value.imageUrl" class="photo-preview-box">
              <img [src]="teamForm.value.imageUrl" alt="Aperçu photo" class="preview-img" />
              <span>✓ Photo sélectionnée</span>
            </div>
            <small *ngIf="uploading" class="status">⏳ Envoi de l'image en cours...</small>
          </label>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" (click)="closeForm()">Annuler</button>
            <button type="submit" class="primary-btn" [disabled]="teamForm.invalid || uploading">
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

      .team-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }
      .team-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.3s;
      }
      .team-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px rgba(0,0,0,0.06);
      }
      .card-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin: 0 auto 1rem;
        position: relative;
        border: 3px solid #d4af37;
        overflow: hidden;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-initials {
        color: #d4af37;
        font-weight: 700;
        font-size: 1.8rem;
        letter-spacing: 0.05em;
      }
      .active-dot {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 14px;
        height: 14px;
        background: #10b981;
        border: 2px solid #fff;
        border-radius: 50%;
        z-index: 2;
      }
      .active-dot.inactive { background: #cbd5e1; }
      .card-body h3 {
        margin: 0 0 0.2rem;
        color: #0f172a;
        font-size: 1.15rem;
      }
      .role {
        color: #d4af37;
        font-weight: 600;
        font-size: 0.85rem;
        margin: 0 0 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .bio {
        color: #334155;
        font-size: 0.92rem;
        margin-bottom: 1.2rem;
        line-height: 1.65;
        white-space: pre-line;
        text-align: left;
        background: #f8fafc;
        padding: 0.8rem 1rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        max-height: 220px;
        overflow-y: auto;
      }
      .photo-preview-box {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        background: #f8fafc;
        border: 1px dashed #d4af37;
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        margin-top: 0.5rem;
      }
      .preview-img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #d4af37;
      }
      .photo-preview-box span {
        font-size: 0.85rem;
        color: #10b981;
        font-weight: 600;
      }

      .card-actions {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        border-top: 1px solid #f1f5f9;
        padding-top: 1rem;
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

      /* Modal styling (reused from events) */
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
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      label { display: flex; flex-direction: column; gap: 0.4rem; font-weight: 600; color: #334155; font-size: 0.9rem; }
      .checkbox-label { flex-direction: row; align-items: center; cursor: pointer; padding-top: 1.5rem; }
      input, textarea {
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font: inherit;
        background: #fbfcfe;
      }
      input:focus, textarea:focus {
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
export class AdminTeamComponent implements OnInit {
  private readonly teamService = inject(AdminTeamService);
  private readonly fb = inject(FormBuilder);

  team: AdminTeamMember[] = [];
  isLoading = true;
  infoMessage = '';
  errorMessage = '';

  showForm = false;
  isEditing = false;
  uploading = false;
  currentMemberId: number | null = null;

  teamForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['', Validators.required],
    bio: [''],
    imageUrl: [''],
    active: [true]
  });

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam() {
    this.teamService.getTeamMembers().subscribe({
      next: (data) => {
        this.team = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Erreur lors du chargement de l'équipe.";
        this.isLoading = false;
      }
    });
  }

  openForm(member?: AdminTeamMember) {
    this.showForm = true;
    this.errorMessage = '';
    this.infoMessage = '';
    if (member) {
      this.isEditing = true;
      this.currentMemberId = member.id;
      this.teamForm.patchValue(member);
    } else {
      this.isEditing = false;
      this.currentMemberId = null;
      this.teamForm.reset({ active: true });
    }
  }

  closeForm() {
    this.showForm = false;
  }

  async onFileSelected(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      try {
        file = await compressImageFile(file);
      } catch (e) {
        console.warn('Compression skipped:', e);
      }
      this.teamService.uploadImage(file).subscribe({
        next: (res) => {
          this.teamForm.patchValue({ imageUrl: res.url });
          this.uploading = false;
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.errorMessage = "Erreur lors de l'upload de l'image.";
          this.uploading = false;
        }
      });
    }
  }

  saveMember() {
    if (this.teamForm.invalid) return;

    const data = this.teamForm.value as Partial<AdminTeamMember>;
    if (this.isEditing && this.currentMemberId) {
      this.teamService.updateTeamMember(this.currentMemberId, data).subscribe({
        next: (updated) => {
          const idx = this.team.findIndex(m => m.id === updated.id);
          if (idx !== -1) this.team[idx] = updated;
          this.closeForm();
          this.infoMessage = 'Membre mis à jour.';
        },
        error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
      });
    } else {
      this.teamService.createTeamMember(data).subscribe({
        next: (created) => {
          this.team.push(created);
          this.closeForm();
          this.infoMessage = 'Membre ajouté.';
        },
        error: () => this.errorMessage = "Erreur lors de l'ajout."
      });
    }
  }

  deleteMember(id: number) {
    if (confirm('Voulez-vous vraiment retirer ce membre ?')) {
      this.teamService.deleteTeamMember(id).subscribe({
        next: () => {
          this.team = this.team.filter(m => m.id !== id);
          this.infoMessage = 'Membre retiré.';
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression.'
      });
    }
  }
}
