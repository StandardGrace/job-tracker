import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs'; // Importing necessary modules from RxJS to handle asynchronous data streams and events between components.

export interface StatusHistoryEntry {
  status: string;
  date: string;
}

export interface Application {
  _id?: string;
  company: string;
  role: string;
  status?: string;
  dateApplied?: string;
  source?: string;
  notes?: string;
  folderLink?: string;
  statusHistory?: StatusHistoryEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationData {
  private apiUrl = '/api/applications';
  private refreshSource = new Subject<void>();
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl);
  }

  getById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  create(application: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application);
  }

  update(id: string, application: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}`, application);
  }

  delete(id: string): Observable<{ message: string; application: Application }> {
    return this.http.delete<{ message: string; application: Application }>(`${this.apiUrl}/${id}`);
  }

  notifyChanged(): void {
    this.refreshSource.next();
  }
}