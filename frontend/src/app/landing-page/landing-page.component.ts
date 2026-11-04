import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly year = new Date().getFullYear();

  activeSection = 'accueil';

  readonly navLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À propos' },
    { id: 'prestations', label: 'Nos prestations' },
    { id: 'accompagnement', label: 'Notre accompagnement' },
    { id: 'evenements-passes', label: 'Événements' },
    { id: 'equipe', label: 'Notre équipe' },
    { id: 'recrutement', label: 'Recrutement' },
    { id: 'partenariats', label: 'Partenariats' },
    { id: 'temoignages', label: 'Témoignages' },
    { id: 'contact', label: 'Contact' },
  ];

  setSection(id: string): void {
    this.activeSection = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly steps = [
    {
      number: '01',
      title: 'Échange sur votre projet',
      icon: '💬',
      description: 'Écoute approfondie de vos besoins, de vos objectifs, du profil de vos invités et de votre budget.'
    },
    {
      number: '02',
      title: 'Conception',
      icon: '💡',
      description: 'Création du concept, sélection des lieux les plus adaptés et élaboration d’un programme sur mesure.'
    },
    {
      number: '03',
      title: 'Proposition & devis',
      icon: '📋',
      description: 'Présentation d’un dossier complet, transparent et détaillé, affiné jusqu’à votre entière validation.'
    },
    {
      number: '04',
      title: 'Préparation',
      icon: '⚙️',
      description: 'Rétroplanning millimétré, logistique, réservations et coordination rigoureuse des prestataires partenaires.'
    },
    {
      number: '05',
      title: 'Coordination du jour J',
      icon: '🏆',
      description: 'Supervision sur place, régie, accueil soigné et maîtrise du timing pour vous faire vivre une expérience sereine.'
    }
  ];

  prestations: any[] = [
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

  activeModalImage: string | null = null;

  openImageModal(src: string): void {
    this.activeModalImage = src;
  }

  closeImageModal(): void {
    this.activeModalImage = null;
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
        'Un séminaire annuel et un team building parfaitement orchestrés. La cohésion de nos équipes en est sortie grandement renforcée.',
      author: 'Directrice des Ressources Humaines, Groupe International',
    },
  ];

  teamMembers: any[] = [];
  jobOffers: any[] = [];
  pastEvents: any[] = [];
  partners: any[] = [];
  clients: any[] = [];

  apiStatus: string | null = null;
  quoteStatus: string | null = null;
  recruitmentStatus: string | null = null;
  contactStatus: string | null = null;
  cvFileName: string | null = null;
  selectedCvFile: File | null = null;

  // Recherche sur le site
  showSearchModal = false;
  searchQuery = '';
  searchResults: { type: string; title: string; subtitle?: string; sectionId: string; icon: string }[] = [];

  ngOnInit() {
    this.http.get<any[]>('/api/public/team').subscribe({
      next: (data) => this.teamMembers = data,
      error: () => console.error('Failed to load team')
    });
    this.http.get<any[]>('/api/public/clients').subscribe({
      next: (data) => this.clients = data,
      error: () => console.error('Failed to load clients')
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
          this.prestations = data.map((s, idx) => ({
            id: 'service-' + s.id,
            title: s.title,
            subtitle: '',
            icon: s.icon || '🛎️',
            intro: s.description || '',
            imageUrl: s.imageUrl || null,
            checklistTitle: '',
            checklist: [],
            tags: [],
            goal: '',
            expanded: idx === 0
          }));
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

  openSearchModal(): void {
    this.showSearchModal = true;
    this.searchQuery = '';
    this.onSearchInput();
  }

  closeSearchModal(): void {
    this.showSearchModal = false;
  }

  selectSearchResult(sectionId: string): void {
    this.setSection(sectionId);
    this.closeSearchModal();
  }

  onSearchInput(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.searchResults = [];
      return;
    }

    const results: { type: string; title: string; subtitle?: string; sectionId: string; icon: string }[] = [];

    // 1. Rechercher dans les rubriques
    const sections = [
      { id: 'accueil', name: 'Accueil', desc: 'Présentation de l\'agence Adelyss Events et vision événementielle B2B', icon: '✨' },
      { id: 'apropos', name: 'À propos de l\'agence', desc: 'Notre histoire, expertise événementielle et valeurs', icon: '🏢' },
      { id: 'prestations', name: 'Nos prestations', desc: 'Séminaires, team building, congrès, lancements et salons', icon: '🛎️' },
      { id: 'accompagnement', name: 'Notre accompagnement', desc: 'Les 5 étapes clés pour réussir votre projet de A à Z', icon: '📋' },
      { id: 'evenements-passes', name: 'Événements & Portfolio', desc: 'Photos et vidéos de nos réalisations précédentes', icon: '🎉' },
      { id: 'equipe', name: 'Notre équipe', desc: 'Direction, coordinateurs et talents événementiels', icon: '👥' },
      { id: 'recrutement', name: 'Recrutement & Carrières', desc: 'Déposer votre CV et postuler aux offres d\'emploi', icon: '💼' },
      { id: 'partenariats', name: 'Partenariats & Sponsors', desc: 'Devenir sponsor, prestataire ou partenaire officiel', icon: '🤝' },
      { id: 'temoignages', name: 'Témoignages & Avis', desc: 'Retours d\'expérience de nos clients professionnels', icon: '⭐' },
      { id: 'contact', name: 'Contact & Demande de devis', desc: 'Écrivez-nous ou recevez une proposition chiffrée gratuite', icon: '✉️' },
    ];

    for (const sec of sections) {
      if (sec.name.toLowerCase().includes(q) || sec.desc.toLowerCase().includes(q)) {
        results.push({
          type: 'Rubrique',
          title: sec.name,
          subtitle: sec.desc,
          sectionId: sec.id,
          icon: sec.icon,
        });
      }
    }

    // 2. Rechercher dans les prestations
    for (const p of this.prestations) {
      const matchTitle = p.title && p.title.toLowerCase().includes(q);
      const matchIntro = p.intro && p.intro.toLowerCase().includes(q);
      if (matchTitle || matchIntro) {
        results.push({
          type: 'Prestation',
          title: p.title,
          subtitle: p.intro ? p.intro.slice(0, 100) + '...' : '',
          sectionId: 'prestations',
          icon: p.icon || '🛎️',
        });
      }
    }

    // 3. Rechercher dans les événements passés
    for (const ev of this.pastEvents) {
      const matchTitle = ev.title && ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description && ev.description.toLowerCase().includes(q);
      if (matchTitle || matchDesc) {
        results.push({
          type: 'Événement',
          title: ev.title,
          subtitle: ev.location ? `${ev.location} - ${ev.date || ''}` : ev.description?.slice(0, 80),
          sectionId: 'evenements-passes',
          icon: '📅',
        });
      }
    }

    // 4. Rechercher dans les offres d'emploi
    for (const job of this.jobOffers) {
      const matchTitle = job.title && job.title.toLowerCase().includes(q);
      const matchDesc = job.description && job.description.toLowerCase().includes(q);
      if (matchTitle || matchDesc) {
        results.push({
          type: 'Offre d\'emploi',
          title: job.title,
          subtitle: job.location ? `${job.location} · ${job.type || 'CDI'}` : '',
          sectionId: 'recrutement',
          icon: '💼',
        });
      }
    }

    this.searchResults = results.slice(0, 8);
  }

  onSubmitContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    
    this.http.post('/api/public/contact', this.contactForm.value).subscribe({
      next: () => {
        this.contactStatus = 'Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais.';
        this.contactForm.reset({ subject: 'contact' });
      },
      error: () => {
        this.contactStatus = 'Erreur lors de l\'envoi du message. Veuillez réessayer ultérieurement.';
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
        this.quoteStatus = 'Votre demande de devis a bien été envoyée avec succès. Notre équipe vous contactera dans les plus brefs délais.';
        this.quoteForm.reset();
      },
      error: () => {
        this.quoteStatus = 'Erreur lors de l\'envoi de la demande. Veuillez vérifier votre connexion ou nous contacter directement.';
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
        this.recruitmentStatus = 'Votre candidature a bien été envoyée à l\'équipe recrutement et nous vous en remercions.';
        this.recruitmentForm.reset();
        this.selectedCvFile = null;
        this.cvFileName = null;
      },
      error: () => {
        this.recruitmentStatus = 'Erreur lors de l\'envoi de votre candidature. Veuillez réessayer ultérieurement.';
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
