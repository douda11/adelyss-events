import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface JobOffer {
  id: number;
  title: string;
  location: string;
  type: string;
  description: string;
  active: boolean;
  createdAt?: string;
}

export interface JobApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  motivation: string;
  cvUrl: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminRecruitmentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
  }

  // Job Offers
  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>('/api/admin/job-offers', { headers: this.authHeaders() });
  }

  createJobOffer(offer: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.post<JobOffer>('/api/admin/job-offers', offer, { headers: this.authHeaders() });
  }

  updateJobOffer(id: number, offer: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.put<JobOffer>(`/api/admin/job-offers/${id}`, offer, { headers: this.authHeaders() });
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/job-offers/${id}`, { headers: this.authHeaders() });
  }

  // Applications
  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>('/api/admin/applications', { headers: this.authHeaders() });
  }

  updateApplicationStatus(id: number, status: string): Observable<JobApplication> {
    return this.http.put<JobApplication>(`/api/admin/applications/${id}/status`, { status }, { headers: this.authHeaders() });
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/applications/${id}`, { headers: this.authHeaders() });
  }
}
