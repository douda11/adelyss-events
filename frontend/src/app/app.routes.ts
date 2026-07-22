import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { adminGuard } from './admin/admin.guard';
import { AdminLoginComponent } from './admin/admin-login.component';
import { AdminQuotesComponent } from './admin/admin-quotes.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
// We will import events and team components once created.

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'quotes', pathMatch: 'full' },
      { path: 'quotes', component: AdminQuotesComponent },
      { path: 'events', loadComponent: () => import('./admin/admin-events.component').then(m => m.AdminEventsComponent) },
      { path: 'team', loadComponent: () => import('./admin/admin-team.component').then(m => m.AdminTeamComponent) },
      { path: 'recruitment/offers', loadComponent: () => import('./admin/admin-job-offers.component').then(m => m.AdminJobOffersComponent) },
      { path: 'recruitment/applications', loadComponent: () => import('./admin/admin-applications.component').then(m => m.AdminApplicationsComponent) },
      { path: 'partners', loadComponent: () => import('./admin/admin-partners.component').then(m => m.AdminPartnersComponent) },
      { path: 'messages', loadComponent: () => import('./admin/admin-messages.component').then(m => m.AdminMessagesComponent) }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
