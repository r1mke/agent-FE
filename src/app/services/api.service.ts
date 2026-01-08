import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageSample, ReviewRequest, SystemStatus } from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5036/api'; 

  constructor(private http: HttpClient) { }

  // --- Samples Controller ---

  // taskType: 1 = Pollen, 2 = Health
  upload(file: File, taskType: number = 1): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskType', taskType.toString());
    return this.http.post(`${this.baseUrl}/Samples/upload`, formData);
  }

  getResults(): Observable<ImageSample[]> {
    return this.http.get<ImageSample[]>(`${this.baseUrl}/Samples/results`);
  }

  getUploadStats(): Observable<{ todayUploads: number, pendingReview: number, reviewed: number }> {
    return this.http.get<{ todayUploads: number, pendingReview: number, reviewed: number }>(`${this.baseUrl}/Samples/stats`);
  }

  getPendingReview(): Observable<{ count: number, samples: ImageSample[] }> {
    return this.http.get<{ count: number, samples: ImageSample[] }>(`${this.baseUrl}/Samples/pending-review`);
  }

  reviewSample(data: ReviewRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Samples/review`, data);
  }

  // --- Admin Controller ---

  triggerRetrain(): Observable<any> {
    return this.http.post(`${this.baseUrl}/Admin/trigger-retrain`, {});
  }

  getStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.baseUrl}/Admin/status`);
  }

  resetDatabase(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Admin/reset-database`);
  }

  updateSettings(retrainThreshold: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Admin/settings?retrainThreshold=${retrainThreshold}`, {});
  }
}