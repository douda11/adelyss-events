import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly year = new Date().getFullYear();

  readonly navLinks = [
    { href: '#accueil', label: 'Accueil' },
    { href: '#apropos', label: 'À propos' },
    { href: '#equipe', label: 'Notre équipe' },
    { href: '#recrutement', label: 'Recrutement' },
    { href: '#evenements-passes', label: 'Événements passés' },
    { href: '#actualites', label: 'Actualités' },
    { href: '#partenariats', label: 'Partenariats' },
    { href: '#temoignages', label: 'Témoignages' },
    { href: '#contact', label: 'Contact' },
  ];

  readonly services = [
    {
      title: 'Événements professionnels',
      text: 'Séminaires, conventions, lancements produit et team building sur mesure.',
    },
    {
      title: 'Événements privés',
      text: 'Mariages, anniversaires et célébrations avec une scénographie soignée.',
    },
    {
      title: 'Nos prestations',
      text: 'Logistique, décoration, coordination jour J et partenaires de confiance.',
    },
  ];

  readonly news = [
    { title: 'Tendances 2026 pour vos événements corporate', date: 'Mars 2026' },
    { title: 'Check-list : réussir votre soirée associative', date: 'Février 2026' },
    { title: 'Nouveau partenariat traiteur premium', date: 'Janvier 2026' },
  ];

  readonly testimonials = [
    {
      quote:
        'Une équipe à l’écoute, un événement fluide du brief au démontage. Nos invités ont été conquis.',
      author: 'Directrice communication, secteur santé',
    },
    {
      quote:
        'Adelyss Events a magnifié notre gala associatif. Professionnalisme et élégance.',
      author: 'Président d’association',
    },
    {
      quote:
        'Mariage de rêve sans stress. Chaque détail était pensé, nous recommandons les yeux fermés.',
      author: 'Mariés, Tunis',
    },
  ];

  teamMembers: any[] = [];
  jobOffers: any[] = [];
  pastEvents: any[] = [];
  partners: any[] = [];

  apiStatus: string | null = null;
  quoteStatus: string | null = null;
  recruitmentStatus: string | null = null;
  cvFileName: string | null = null;
  selectedCvFile: File | null = null;

  ngOnInit() {
    this.http.get<any[]>('/api/public/team').subscribe({
      next: (data) => this.teamMembers = data,
      error: () => console.error('Failed to load team')
    });
    this.http.get<any[]>('/api/public/job-offers').subscribe({
      next: (data) => this.jobOffers = data,
      error: () => console.error('Failed to load job offers')
    });
    this.http.get<any[]>('/api/public/events').subscribe({
      next: (data) => this.pastEvents = data,
      error: () => console.error('Failed to load events')
    });
    this.http.get<any[]>('/api/public/partners').subscribe({
      next: (data) => this.partners = data,
      error: () => console.error('Failed to load partners')
    });
  }

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['contact', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  quoteForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    eventType: ['', Validators.required],
    estimatedBudget: ['', Validators.required],
    eventDate: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(20)]],
  });

  recruitmentForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    position: ['', Validators.required],
    motivation: ['', [Validators.required, Validators.minLength(20)]],
  });

  onSubmitContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    
    this.http.post('/api/public/contact', this.contactForm.value).subscribe({
      next: () => {
        alert('Merci ! Votre message a bien été envoyé à notre équipe.');
        this.contactForm.reset({ subject: 'contact' });
      },
      error: () => {
        alert('Erreur lors de l\'envoi. Veuillez réessayer plus tard ou redémarrer le backend.');
      }
    });
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedCvFile = null;
      this.cvFileName = null;
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedExtensions.includes(extension)) {
      this.selectedCvFile = null;
      this.cvFileName = null;
      this.recruitmentStatus = 'Format non supporté. Utilisez PDF, DOC ou DOCX.';
      input.value = '';
      return;
    }

    this.selectedCvFile = file;
    this.cvFileName = file.name;
    this.recruitmentStatus = null;
  }

  onSubmitQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    this.http.post('/api/quotes', this.quoteForm.value).subscribe({
      next: () => {
        this.quoteStatus = 'Votre demande de devis a bien été envoyée.';
        this.quoteForm.reset();
      },
      error: () => {
        this.quoteStatus =
          'Devis enregistré en mode démo. Branchez le backend sur POST /api/quotes pour la persistance.';
      },
    });
  }

  onSubmitRecruitment(): void {
    if (this.recruitmentForm.invalid || !this.selectedCvFile) {
      this.recruitmentForm.markAllAsTouched();
      if (!this.selectedCvFile) {
        this.recruitmentStatus = 'Veuillez joindre votre CV avant envoi.';
      }
      return;
    }

    const payload = new FormData();
    payload.append('fullName', this.recruitmentForm.value.fullName ?? '');
    payload.append('email', this.recruitmentForm.value.email ?? '');
    payload.append('phone', this.recruitmentForm.value.phone ?? '');
    payload.append('position', this.recruitmentForm.value.position ?? '');
    payload.append('motivation', this.recruitmentForm.value.motivation ?? '');
    payload.append('cv', this.selectedCvFile);

    this.http.post('/api/recruitment/applications', payload).subscribe({
      next: () => {
        this.recruitmentStatus = 'Votre candidature a bien été envoyée.';
        this.recruitmentForm.reset();
        this.selectedCvFile = null;
        this.cvFileName = null;
      },
      error: () => {
        this.recruitmentStatus =
          'Candidature enregistrée en mode démo. Branchez le backend sur POST /api/recruitment/applications.';
      },
    });
  }

  checkApi(): void {
    this.http.get<{ status: string }>('/api/health').subscribe({
      next: (r) => (this.apiStatus = r.status === 'ok' ? 'API connectée' : 'Réponse inattendue'),
      error: () => (this.apiStatus = 'API hors ligne (lancez Spring Boot sur le port 8080)'),
    });
  }
}
