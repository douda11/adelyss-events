import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceOffer {
  id: number;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminServiceOfferService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/services';

  private headers(): HttpHeaders {
    const token = localStorage.getItem('adelyss_admin_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getServices(): Observable<ServiceOffer[]> {
    return this.http.get<ServiceOffer[]>(this.baseUrl, { headers: this.headers() });
  }

  createService(data: Partial<ServiceOffer>): Observable<ServiceOffer> {
    return this.http.post<ServiceOffer>(this.baseUrl, data, { headers: this.headers() });
  }

  updateService(id: number, data: Partial<ServiceOffer>): Observable<ServiceOffer> {
    return this.http.put<ServiceOffer>(`${this.baseUrl}/${id}`, data, { headers: this.headers() });
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers() });
  }
}
