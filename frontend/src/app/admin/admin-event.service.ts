import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface AdminEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AdminEventService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);
  private readonly baseUrl = '/api/admin/events';

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  getEvents(): Observable<AdminEvent[]> {
    return this.http.get<AdminEvent[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  createEvent(event: Partial<AdminEvent>): Observable<AdminEvent> {
    return this.http.post<AdminEvent>(this.baseUrl, event, { headers: this.authHeaders() });
  }

  updateEvent(id: number, event: Partial<AdminEvent>): Observable<AdminEvent> {
    return this.http.put<AdminEvent>(`${this.baseUrl}/${id}`, event, { headers: this.authHeaders() });
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string}>('/api/admin/upload', formData, { headers: this.authHeaders() });
  }
}
