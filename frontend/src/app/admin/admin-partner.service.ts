import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface Partner {
  id: number;
  name: string;
  type: string; // PARTNER or SPONSOR
  logoUrl: string;
  websiteUrl: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPartnerService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
  }

  getPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>('/api/admin/partners', { headers: this.authHeaders() });
  }

  createPartner(partner: Partial<Partner>): Observable<Partner> {
    return this.http.post<Partner>('/api/admin/partners', partner, { headers: this.authHeaders() });
  }

  updatePartner(id: number, partner: Partial<Partner>): Observable<Partner> {
    return this.http.put<Partner>(`/api/admin/partners/${id}`, partner, { headers: this.authHeaders() });
  }

  deletePartner(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/partners/${id}`, { headers: this.authHeaders() });
  }
}
