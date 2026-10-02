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
    { href: '#pourquoi-un-evenement', label: 'Pourquoi un événement ?' },
    { href: '#prestations', label: 'Nos prestations' },
    { href: '#apropos', label: 'À propos' },
    { href: '#equipe', label: 'Notre équipe' },
    { href: '#recrutement', label: 'Recrutement' },
    { href: '#evenements-passes', label: 'Événements' },
    { href: '#partenariats', label: 'Partenariats' },
    { href: '#temoignages', label: 'Témoignages' },
    { href: '#contact', label: 'Contact' },
  ];

  prestations = [
    {
      id: 'team-building',
      title: 'TEAM BUILDING',
      subtitle: 'Créer du lien, renforcer la cohésion',
      icon: '🤝',
      intro: `Parce qu'une équipe soudée est aussi une équipe qui sait partager des moments en dehors du cadre habituel de travail.

Nous imaginons des journées de team building adaptées à vos équipes : activités collaboratives, challenges, jeux, animations, moments de détente et expériences originales.`,
      checklistTitle: 'Nous pouvons prendre en charge :',
      checklist: [
        'Recherche et sélection du lieu idéal',
        'Création du programme sur mesure',
        'Activités et challenges d’équipe immersifs',
        'Animations professionnelles & team building',
        'Restauration, pauses café et cocktails',
        'Coordination des différents intervenants',
        'Organisation et suivi complet du jour J'
      ],
      goal: 'Offrir aux collaborateurs une véritable parenthèse collective, propice aux échanges, à la convivialité et à la cohésion.',
      expanded: true
    },
    {
      id: 'seminaires',
      title: 'SÉMINAIRES',
      subtitle: 'Travailler autrement, ensemble',
      icon: '🏢',
      intro: `Un séminaire est l'occasion de réunir les équipes dans un environnement différent pour travailler, échanger, réfléchir et partager.

Adelyss Events vous accompagne dans l'organisation de séminaires professionnels adaptés à vos objectifs.

De la recherche du lieu à la coordination du programme, nous construisons un événement qui alterne efficacement temps de travail, moments de convivialité et expériences collectives.`,
      checklistTitle: 'Selon vos besoins :',
      checklist: [
        'Séminaires résidentiels ou à la journée',
        'Salles de réunion équipées et modulables',
        'Accueil personnalisé des participants',
        'Pauses café et collations soignées',
        'Déjeuners d’affaires et dîners de gala',
        'Activités de cohésion & ateliers de travail',
        'Animations thématiques',
        'Coordination logistique de A à Z'
      ],
      goal: 'Concilier efficacité de travail et renforcement de l’esprit d’équipe dans un cadre propice à l’inspiration.',
      expanded: false
    },
    {
      id: 'conferences',
      title: 'CONFÉRENCES & RENCONTRES PROFESSIONNELLES',
      subtitle: 'Donner de l’impact à vos rendez-vous professionnels',
      icon: '🎤',
      intro: `Conférence, présentation, réunion importante, rencontre avec des partenaires ou événement corporate : chaque détail participe à l'image de votre entreprise.

Nous vous accompagnons dans la mise en place d'un événement fluide, élégant et résolument professionnel.

De l'accueil des participants à la coordination sur place, nous veillons à ce que chaque étape soit pensée avec une précision absolue.`,
      tags: [
        'Lieu prestigieux',
        'Concept sur mesure',
        'Scénographie & Décoration',
        'Restauration haut de gamme',
        'Animation & Modération',
        'Régie & Logistique',
        'Coordination jour J'
      ],
      goal: 'Chez Adelyss Events, nous partons de votre idée et construisons autour d’elle. Bref, vous avez l’idée ? Nous créons l’expérience.',
      expanded: false
    }
  ];

  togglePrestation(index: number): void {
    this.prestations[index].expanded = !this.prestations[index].expanded;
  }

  services: {title: string, text: string, icon?: string}[] = [];

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
    this.http.get<any[]>('/api/public/services').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.services = data.map(s => ({ title: s.title, text: s.description, icon: s.icon }));
        }
      },
      error: () => console.error('Failed to load services')
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
