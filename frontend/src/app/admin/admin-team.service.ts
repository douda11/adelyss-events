import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface AdminTeamMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  imageUrl: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminTeamService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);
  private readonly baseUrl = '/api/admin/team';

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  getTeamMembers(): Observable<AdminTeamMember[]> {
    return this.http.get<AdminTeamMember[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  createTeamMember(member: Partial<AdminTeamMember>): Observable<AdminTeamMember> {
    return this.http.post<AdminTeamMember>(this.baseUrl, member, { headers: this.authHeaders() });
  }

  updateTeamMember(id: number, member: Partial<AdminTeamMember>): Observable<AdminTeamMember> {
    return this.http.put<AdminTeamMember>(`${this.baseUrl}/${id}`, member, { headers: this.authHeaders() });
  }

  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string}>('/api/admin/upload', formData, { headers: this.authHeaders() });
  }
}
