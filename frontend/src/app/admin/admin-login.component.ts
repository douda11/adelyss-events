import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="admin-login-shell">
      <div class="admin-login-overlay"></div>
      <div class="admin-login-card">
        <div class="brand">
          <span class="brand-mark">A</span>
          <div>
            <p class="brand-title">Adelyss Events</p>
            <p class="brand-subtitle">Administration</p>
          </div>
        </div>

        <h1>Connexion Backoffice</h1>
        <p class="hint">
          Connectez-vous pour gerer les devis, repondre aux clients et suivre les demandes.
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <label>
            Email professionnel
            <input type="email" formControlName="email" placeholder="admin@adelyss.com" />
          </label>

          <label>
            Mot de passe
            <input type="password" formControlName="password" placeholder="Votre mot de passe" />
          </label>

          <button type="submit" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Connexion...' : 'Acceder au backoffice' }}
          </button>
        </form>

        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      </div>
    </section>
  `,
  styles: [
    `
      .admin-login-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        position: relative;
        background:
          linear-gradient(130deg, rgba(13, 27, 58, 0.9) 0%, rgba(13, 27, 58, 0.75) 100%),
          url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=80')
            center / cover no-repeat;
        padding: 1.25rem;
      }

      .admin-login-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top right, rgba(201, 162, 39, 0.2), transparent 38%);
      }

      .admin-login-card {
        position: relative;
        width: min(460px, 100%);
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(13, 27, 58, 0.25);
        padding: 2rem;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .brand-mark {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        border: 2px solid var(--color-gold);
        color: var(--color-gold);
        font-family: var(--font-display);
        font-size: 1.2rem;
      }

      .brand-title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 700;
        color: var(--color-navy);
      }

      .brand-subtitle {
        margin: 0.1rem 0 0;
        font-size: 0.82rem;
        color: var(--color-muted);
      }

      h1 {
        margin: 0;
        color: var(--color-navy);
        font-family: var(--font-display);
        font-size: 1.8rem;
      }

      .hint {
        color: var(--color-muted);
        margin: 0.65rem 0 1.25rem;
        line-height: 1.55;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--color-navy);
        font-size: 0.9rem;
      }

      input {
        padding: 0.7rem 0.8rem;
        border: 1px solid rgba(13, 27, 58, 0.2);
        border-radius: 8px;
        background: #f9fafc;
        font: inherit;
      }

      button {
        background: var(--color-gold);
        color: var(--color-navy);
        border: 0;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .error {
        color: #b42318;
        font-weight: 600;
        margin: 0.9rem 0 0;
      }
    `,
  ],
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isSubmitting = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.login(email ?? '', password ?? '').subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/admin/quotes');
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Connexion invalide. Verifiez vos identifiants admin.';
      },
    });
  }
}
