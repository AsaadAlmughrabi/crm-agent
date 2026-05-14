import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Response from the upload endpoint
 */
export interface UploadResponse {
  message: string;
  status?: string;
  rows?: number;
  columns?: string[];
  reports_ready?: boolean;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Chat response from the API
 */
export interface ChatResponse {
  output: string;
  response?: string; // Deprecated, keeping for backward compatibility
  filename?: string;
  status?: 'success' | 'error';
}

/**
 * Shared report analysis context returned by backend report endpoints
 */
export interface ReportAnalysisContext {
  [key: string]: unknown;
}

/**
 * Report summary response from the backend
 */
export interface ReportSummaryResponse {
  summary_report: string;
  analysis_context?: ReportAnalysisContext;
  status?: 'success' | 'error';
}

/**
 * Report prediction response from the backend
 */
export interface ReportPredictionResponse {
  prediction_report: string;
  summary_report?: string;
  analysis_context?: ReportAnalysisContext;
  status?: 'success' | 'error';
}

/**
 * Service for managing file uploads and chat
 */
@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private readonly API_BASE_URL = 'http://localhost:8000';

  // Headers for ngrok
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
    }),
  };

  // Signal to track upload progress
  isUploading = signal(false);

  // Signal to track current upload summary
  uploadSummary = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Upload a file
   */
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.isUploading.set(true);

    return this.http
      .post<UploadResponse>(`${this.API_BASE_URL}/upload`, formData)
      .pipe(
        tap({
          next: () => {
            this.isUploading.set(false);
          },
          error: () => {
            this.isUploading.set(false);
          },
        })
      );
  }

  /**
   * Send chat message and get response
   */
  sendChatMessage(question: string): Observable<ChatResponse> {
    const params = new URLSearchParams();
    params.append('question', question);

    return this.http.get<ChatResponse>(
      `${this.API_BASE_URL}/chat?${params.toString()}`,
      this.httpOptions
    );
  }

  /**
   * Get backend-generated report summary based on computed file metrics
   */
  getSummary(): Observable<ReportSummaryResponse> {
    return this.http.get<ReportSummaryResponse>(
      `${this.API_BASE_URL}/reportsummary`,
      this.httpOptions
    );
  }

  /**
   * Get backend-generated report prediction that is connected to the same summary/context
   */
  getPrediction(): Observable<ReportPredictionResponse> {
    return this.http.get<ReportPredictionResponse>(
      `${this.API_BASE_URL}/reportprediction`,
      this.httpOptions
    );
  }
}
