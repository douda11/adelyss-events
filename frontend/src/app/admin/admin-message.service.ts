import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string; // NEW, READ, REPLIED
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminMessageService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken() ?? ''}` });
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>('/api/admin/messages', { headers: this.authHeaders() });
  }

  updateStatus(id: number, status: string): Observable<ContactMessage> {
    return this.http.put<ContactMessage>(`/api/admin/messages/${id}/status`, { status }, { headers: this.authHeaders() });
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/messages/${id}`, { headers: this.authHeaders() });
  }

  replyToMessage(id: number, message: string): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(
      `/api/admin/messages/${id}/reply`,
      { message },
      { headers: this.authHeaders() }
    );
  }
}
