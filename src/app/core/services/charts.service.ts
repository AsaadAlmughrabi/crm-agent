import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Response from challenges-summary endpoint
 */
export interface ChallengesSummaryResponse {
  total_challenges: number;
  processing_challenges: number;
  closed_challenges: number;
  notClosed_challenges: number;
  closed_percentage: number;
}

/**
 * Individual channel source data
 */
export interface ChannelSourceData {
  'Channel Source': string;
  total_challenges: number;
  closed_challenges: number;
  processing_challenges: number;
  notClosed_challenges: number;
  closed_percentage: number;
}

/**
 * Response from challenges-summary with group_by parameter
 */
export interface ChallengesByChannelResponse {
  data: ChannelSourceData[];
}

/**
 * Type distribution item
 */
export interface TypeDistributionItem {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Response from challenges-by-type endpoint
 */
export interface ChallengesByTypeResponse {
  type_distribution: TypeDistributionItem[];
  total_challenges: number;
}

/**
 * Monthly challenge data for a channel source
 */
export interface MonthlyChannelData {
  'Channel Source'?: string;
  Owner?: string;
  opened_challenges: number;
  closed_challenges: number;
}

/**
 * Response from monthly-challenges endpoint
 */
export interface MonthlyChallengesResponse {
  [month: string]: MonthlyChannelData[];
}

/**
 * Owner data for challenges
 */
export interface OwnerData {
  Owner: string;
  total_challenges: number;
  closed_challenges: number;
  processing_challenges: number;
  repeated_challenges: number;
  notClosed_challenges: number;
  closed_percentage: number;
}

/**
 * Response from challenges-summary with group_by Owner
 */
export interface ChallengesByOwnerResponse {
  data: OwnerData[];
}

/**
 * Challenge description item
 */
export interface ChallengeDescriptionItem {
  status: string;
  count: number;
}

/**
 * Response from challenge-description endpoint
 */
export type ChallengeDescriptionResponse = ChallengeDescriptionItem[];

/**
 * Service description item (same structure as ChallengeDescriptionItem)
 */
export interface ServiceDescriptionItem {
  status: string;
  count: number;
}

/**
 * Response from challenge-description with service parameters
 */
export type ServiceDescriptionResponse = ServiceDescriptionItem[];

/**
 * Facility description item (same structure)
 */
export interface FacilityDescriptionItem {
  status: string;
  count: number;
}

/**
 * Response from challenge-description with facility parameter
 */
export type FacilityDescriptionResponse = FacilityDescriptionItem[];

/**
 * Case origin sector item
 */
export interface CaseOriginSectorItem {
  status: string;
  count: number;
}

/**
 * Response from challenge-description with Case Origin Sector parameter
 */
export type CaseOriginSectorResponse = CaseOriginSectorItem[];

/**
 * Completion days data item
 */
export interface CompletionDaysItem {
  Owner: string;
  avg_days: number;
  total_solved: number;
}

/**
 * Response from challenges-completion-days endpoint
 */
export interface ChallengesCompletionDaysResponse {
  completion_data: CompletionDaysItem[];
}

/**
 * Status completion days item
 */
export interface StatusCompletionDaysItem {
  status_number: string;
  completion_days: number[];
  analysis: string;
}

/**
 * Response from status-completion-days endpoint
 */
export type StatusCompletionDaysResponse = StatusCompletionDaysItem[];

/**
 * Service for managing charts and statistics data
 */
@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  private readonly API_BASE_URL = 'http://localhost:8000';

  // Headers for ngrok
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Get challenges summary statistics
   */
  getChallengesSummary(): Observable<ChallengesSummaryResponse> {
    return this.http.get<ChallengesSummaryResponse>(
      `${this.API_BASE_URL}/challenges-summary`,
      this.httpOptions
    );
  }

  /**
   * Get challenges summary grouped by channel source
   * @param groupBy - The field to group by (e.g., 'المنشأ')
   */
  getChallengesByChannel(groupBy: string): Observable<ChallengesByChannelResponse> {
    return this.http.get<ChallengesByChannelResponse>(
      `${this.API_BASE_URL}/challenges-summary?group_by=${encodeURIComponent(groupBy)}`,
      this.httpOptions
    );
  }

  /**
   * Get monthly challenges data grouped by channel source
   * @param groupBy - The field to group by (e.g., 'المنشأ')
   */
  getMonthlyChallenges(groupBy: string): Observable<MonthlyChallengesResponse> {
    return this.http.get<MonthlyChallengesResponse>(
      `${this.API_BASE_URL}/monthly-challenges?group_by=${encodeURIComponent(groupBy)}`,
      this.httpOptions
    );
  }

  /**
   * Get challenges by type distribution
   */
  getChallengesByType(): Observable<ChallengesByTypeResponse> {
    return this.http.get<ChallengesByTypeResponse>(
      `${this.API_BASE_URL}/challenges-by-type`,
      this.httpOptions
    );
  }

  /**
   * Get challenge description/status distribution
   */
  getChallengeDescription(): Observable<ChallengeDescriptionResponse> {
    return this.http.get<ChallengeDescriptionResponse>(
      `${this.API_BASE_URL}/challenge-description`,
      this.httpOptions
    );
  }

  /**
   * Get challenges summary grouped by owner
   * @param groupBy - The field to group by (e.g., 'المالك')
   */
  getChallengesByOwner(groupBy: string): Observable<ChallengesByOwnerResponse> {
    return this.http.get<ChallengesByOwnerResponse>(
      `${this.API_BASE_URL}/challenges-summary?group_by=${encodeURIComponent(groupBy)}`,
      this.httpOptions
    );
  }

  /**
   * Get main services distribution
   * @param description - The description parameter (e.g., 'الخدمة الرئيسية')
   */
  getMainServices(description: string): Observable<ServiceDescriptionResponse> {
    return this.http.get<ServiceDescriptionResponse>(
      `${this.API_BASE_URL}/challenge-description?description=${encodeURIComponent(description)}`,
      this.httpOptions
    );
  }

  /**
   * Get sub services distribution
   * @param description - The description parameter (e.g., 'الخدمة الفرعية')
   */
  getSubServices(description: string): Observable<ServiceDescriptionResponse> {
    return this.http.get<ServiceDescriptionResponse>(
      `${this.API_BASE_URL}/challenge-description?description=${encodeURIComponent(description)}`,
      this.httpOptions
    );
  }

  /**
   * Get facilities distribution
   * @param description - The description parameter (e.g., 'المنشأ')
   */
  getFacilities(description: string): Observable<FacilityDescriptionResponse> {
    return this.http.get<FacilityDescriptionResponse>(
      `${this.API_BASE_URL}/challenge-description?description=${encodeURIComponent(description)}`,
      this.httpOptions
    );
  }

  /**
   * Get case origin sector distribution
   */
  getCaseOriginSector(): Observable<CaseOriginSectorResponse> {
    return this.http.get<CaseOriginSectorResponse>(
      `${this.API_BASE_URL}/challenge-description?description=${encodeURIComponent(
        'Case Origin Sector'
      )}`,
      this.httpOptions
    );
  }

  /**
   * Get challenges completion days grouped by owner
   * @param groupBy - The field to group by (e.g., 'Owner')
   */
  getChallengesCompletionDays(groupBy: string): Observable<ChallengesCompletionDaysResponse> {
    return this.http.get<ChallengesCompletionDaysResponse>(
      `${this.API_BASE_URL}/challenges-completion-days?group_by=${encodeURIComponent(groupBy)}`,
      this.httpOptions
    );
  }

  /**
   * Get status completion days with analysis
   */
  getStatusCompletionDays(): Observable<StatusCompletionDaysResponse> {
    return this.http.get<StatusCompletionDaysResponse>(
      `${this.API_BASE_URL}/status-completion-days`,
      this.httpOptions
    );
  }
}
