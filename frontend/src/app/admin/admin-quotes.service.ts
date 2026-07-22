import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface AdminQuote {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string | null;
  estimatedBudget: number | null;
  details: string | null;
  status: string;
  adminReplyMessage: string | null;
  repliedBy: string | null;
  repliedAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminQuotesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  getQuotes(): Observable<AdminQuote[]> {
    return this.http.get<AdminQuote[]>('/api/admin/quotes', { headers: this.authHeaders() });
  }

  replyToQuote(id: number, subject: string, message: string, status = 'REPLIED'): Observable<AdminQuote> {
    return this.http.post<AdminQuote>(
      `/api/admin/quotes/${id}/reply`,
      { subject, message, status },
      { headers: this.authHeaders() }
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}
