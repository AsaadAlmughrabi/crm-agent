import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MarkdownModule } from 'ngx-markdown';
import { AnalysisService, ChatMessage } from '../core/services/analysis.service';
import { ChartsService } from '../core/services/charts.service';
import { ToastService } from '../core/services/toast.service';
import { UploadCard } from '../shared/components/upload-card/upload-card';
import { ChatComponent } from '../shared/components/chat/chat.component';
import { TabNavigationComponent } from '../shared/components/tab-navigation/tab-navigation.component';
import { ChartsComponent } from '../shared/components/charts/charts.component';
import { SummaryComponent } from '../shared/components/summary/summary.component';
import type { TabType } from '../shared/components/tab-navigation/tab-navigation.component';

Chart.register(...registerables);

/**
 * DashboardComponent - Main page with Upload + Charts tabs and a Chat panel
 *
 * LAYOUT:
 * - Left Panel: Tab view with Upload, Charts
 * - Right Panel: Chat interface
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    UploadCard,
    ChatComponent,
    TabNavigationComponent,
    ChartsComponent,
    SummaryComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, AfterViewInit, AfterViewChecked {
  // Color palette for charts - ARIBA brand-led
  private readonly CHART_COLORS = [
    '#2DBE5C', // ARIBA spring green
    '#0E5132', // ARIBA dark green
    '#5DD68F', // light spring green
    '#9BDFC4', // mint
    '#62B2FD', // blue
    '#FFB44F', // amber
    '#f2758a', // rose
    '#9F97F7', // violet
    '#f97316', // orange
    '#0ea5e9', // sky
    '#70757e', // slate
  ];

  // Chart canvas refs
  @ViewChild('challengesByTypeChart') challengesByTypeChartRef?: ElementRef;
  @ViewChild('challengesByChannelChart') challengesByChannelChartRef?: ElementRef;
  @ViewChild('mainServicesChart') mainServicesChartRef?: ElementRef;
  @ViewChild('facilitiesChart') facilitiesChartRef?: ElementRef;
  @ViewChild('caseOriginSectorChart') caseOriginSectorChartRef?: ElementRef;

  // Tab state
  activeTab = signal<TabType>('upload');

  // Upload state
  isDragOver = signal(false);
  uploadedFileName = signal<string | null>(null);
  uploadError = signal<string | null>(null);
  uploadSuccess = signal<string | null>(null);
  isProcessingData = signal(false);

  // Data state
  isLoadingData = signal(false);
  dataError = signal<string | null>(null);
  chartsData = signal<any>(null);
  chartsInitialized = signal(false);

  // Individual loading states for charts/tables
  isLoadingSummary = signal(false);
  isLoadingByChannel = signal(false);
  isLoadingMonthly = signal(false);
  isLoadingByType = signal(false);
  isLoadingByOwner = signal(false);
  isLoadingMainServices = signal(false);
  isLoadingSubServices = signal(false);
  isLoadingFacilities = signal(false);
  isLoadingCaseOriginSector = signal(false);
  isLoadingCompletionDays = signal(false);

  // Monthly challenges table state
  selectedMonth = signal<string | null>(null);
  monthlyTableExpanded = signal(false);

  // Chat state
  chatMessages = signal<ChatMessage[]>([]);
  chatInput = signal<string>('');
  isTyping = signal(false);
  chatError = signal<string | null>(null);

  // Summary state (chat-based with fixed prompt)
  summaryReport = signal<string | null>(null);
  isLoadingSummaryReport = signal(false);
  summaryError = signal<string | null>(null);

  // Prediction state (chat-based with fixed prompt)
  predictionReport = signal<string | null>(null);
  isLoadingPrediction = signal(false);
  predictionError = signal<string | null>(null);

  constructor(
    protected analysisService: AnalysisService,
    protected chartsService: ChartsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Don't load anything on initialization - wait for user to upload file
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after view is ready
  }

  ngAfterViewChecked(): void {
    // Initialize charts if we're on charts tab, have data, but haven't initialized yet
    if (
      this.activeTab() === 'charts' &&
      this.chartsData() &&
      !this.chartsInitialized() &&
      !this.isLoadingData()
    ) {
      this.initCharts();
      this.chartsInitialized.set(true);
      this.cdr.detectChanges();
    }
  }

  /**
   * Switch active tab
   */
  switchTab(tab: TabType): void {
    this.activeTab.set(tab);

    if (tab !== 'charts') {
      this.chartsInitialized.set(false);
    }

    if (tab === 'charts' && this.chartsData() && !this.chartsInitialized()) {
      setTimeout(() => {
        this.initCharts();
        this.chartsInitialized.set(true);
      }, 100);
    }
  }

  /**
   * Load summary via chat with fixed prompt
   */
  loadSummary(): void {
    this.isLoadingSummaryReport.set(true);
    this.summaryError.set(null);

    this.analysisService.getSummary().subscribe({
      next: (response) => {
        const content = response.output || response.response;
        if (content) {
          this.summaryReport.set(content);
        } else {
          this.summaryError.set('فشل الحصول على رد صالح من الخادم.');
        }
        this.isLoadingSummaryReport.set(false);
      },
      error: () => {
        this.summaryError.set('تعذر تحميل الملخص. يرجى المحاولة مرة أخرى.');
        this.isLoadingSummaryReport.set(false);
      },
    });
  }

  /**
   * Load prediction via chat with fixed prompt
   */
  loadPrediction(): void {
    this.isLoadingPrediction.set(true);
    this.predictionError.set(null);

    this.analysisService.getPrediction().subscribe({
      next: (response) => {
        const content = response.output || response.response;
        if (content) {
          this.predictionReport.set(content);
        } else {
          this.predictionError.set('فشل الحصول على رد صالح من الخادم.');
        }
        this.isLoadingPrediction.set(false);
      },
      error: () => {
        this.predictionError.set('تعذر تحميل التنبؤ. يرجى المحاولة مرة أخرى.');
        this.isLoadingPrediction.set(false);
      },
    });
  }

  /**
   * Load charts data from API - load each independently
   */
  loadChartsData(): void {
    this.isLoadingData.set(true);
    this.dataError.set(null);

    let completedRequests = 0;
    const totalRequests = 10;

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoadingData.set(false);
      }
    };

    this.isLoadingSummary.set(true);
    this.chartsService.getChallengesSummary().subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, summary: data }));
        this.isLoadingSummary.set(false);
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingSummary.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingByChannel.set(true);
    this.chartsService.getChallengesByChannel('Channel Source').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, byChannel: data }));
        this.isLoadingByChannel.set(false);
        if (data && this.challengesByChannelChartRef) {
          setTimeout(() => this.createChallengesByChannelChart(data), 50);
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingByChannel.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingMonthly.set(true);
    this.chartsService.getMonthlyChallenges('Owner').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, monthly: data }));
        this.isLoadingMonthly.set(false);
        if (data && !this.selectedMonth()) {
          const months = Object.keys(data).sort();
          if (months.length > 0) {
            this.selectedMonth.set(months[months.length - 1]);
          }
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingMonthly.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingByType.set(true);
    this.chartsService.getChallengesByType().subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, byType: data }));
        this.isLoadingByType.set(false);
        if (data && this.challengesByTypeChartRef) {
          setTimeout(() => this.createChallengesByTypeChart(data), 50);
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingByType.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingByOwner.set(true);
    this.chartsService.getChallengesByOwner('Owner').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, byOwner: data }));
        this.isLoadingByOwner.set(false);
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingByOwner.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingMainServices.set(true);
    this.chartsService.getMainServices('Main Category').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, mainServices: data }));
        this.isLoadingMainServices.set(false);
        if (data && this.mainServicesChartRef) {
          setTimeout(() => this.createMainServicesChart(data), 50);
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingMainServices.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingSubServices.set(true);
    this.chartsService.getSubServices('Sub Category').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, subServices: data }));
        this.isLoadingSubServices.set(false);
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingSubServices.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingFacilities.set(true);
    this.chartsService.getFacilities('Channel Source').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, facilities: data }));
        this.isLoadingFacilities.set(false);
        if (data && this.facilitiesChartRef) {
          setTimeout(() => this.createFacilitiesChart(data), 50);
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingFacilities.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingCaseOriginSector.set(true);
    this.chartsService.getCaseOriginSector().subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, caseOriginSector: data }));
        this.isLoadingCaseOriginSector.set(false);
        if (data && this.caseOriginSectorChartRef) {
          setTimeout(() => this.createCaseOriginSectorChart(data), 50);
        }
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingCaseOriginSector.set(false);
        checkAllLoaded();
      },
    });

    this.isLoadingCompletionDays.set(true);
    this.chartsService.getChallengesCompletionDays('Owner').subscribe({
      next: (data) => {
        this.chartsData.update((current) => ({ ...current, completionDays: data }));
        this.isLoadingCompletionDays.set(false);
        checkAllLoaded();
      },
      error: () => {
        this.isLoadingCompletionDays.set(false);
        checkAllLoaded();
      },
    });
  }

  // ==================== UPLOAD TAB METHODS ====================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  handleFileSelected(file: File): void {
    this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File): void {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith('.xlsx') &&
      !file.name.endsWith('.xls')
    ) {
      this.uploadError.set('يرجى رفع ملف Excel (.xlsx أو .xls)');
      return;
    }

    this.clearUploadMessages();
    this.uploadedFileName.set(file.name);

    // Reset previous summary/prediction so fresh data triggers a new load
    this.summaryReport.set(null);
    this.summaryError.set(null);
    this.predictionReport.set(null);
    this.predictionError.set(null);

    this.analysisService.uploadFile(file).subscribe({
      next: () => {
        this.isProcessingData.set(true);
        // Load charts, summary, and prediction in parallel so tabs are ready
        this.loadChartsData();
        this.loadSummary();
        this.loadPrediction();
        this.isProcessingData.set(false);
        this.activeTab.set('charts');
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadError.set('فشل الرفع. يرجى المحاولة مرة أخرى.');
        this.uploadedFileName.set(null);
        this.isProcessingData.set(false);
        this.toastService.error('فشل الرفع. يرجى التحقق من الملف والمحاولة مرة أخرى.');
      },
    });
  }

  private clearUploadMessages(): void {
    this.uploadError.set(null);
    this.uploadSuccess.set(null);
  }

  // ==================== CHART METHODS ====================

  /**
   * Initialize all charts with API data
   */
  private initCharts(): void {
    const data = this.chartsData();
    if (!data) return;

    if (data.byType) {
      this.createChallengesByTypeChart(data.byType);
    }

    if (data.byChannel) {
      this.createChallengesByChannelChart(data.byChannel);
    }

    if (data.mainServices) {
      this.createMainServicesChart(data.mainServices);
    }

    if (data.facilities) {
      this.createFacilitiesChart(data.facilities);
    }

    if (data.caseOriginSector) {
      this.createCaseOriginSectorChart(data.caseOriginSector);
    }

    if (data.monthly && !this.selectedMonth()) {
      const months = Object.keys(data.monthly).sort();
      if (months.length > 0) {
        this.selectedMonth.set(months[months.length - 1]);
      }
    }
  }

  /**
   * Create challenges by type pie chart
   */
  private createChallengesByTypeChart(data: any): void {
    if (!this.challengesByTypeChartRef || !data.type_distribution) return;

    const labels = data.type_distribution.map((item: any) => item.type);
    const values = data.type_distribution.map((item: any) => item.count);

    this.createDoughnutChart(this.challengesByTypeChartRef, 'تصنيف الحالات حسب النوع', labels, values);
  }

  /**
   * Create challenges by channel horizontal bar chart - STACKED
   */
  private createChallengesByChannelChart(data: any): void {
    if (!this.challengesByChannelChartRef || !data.data) return;

    const channels = data.data;
    const labels = channels.map((item: any) => item['Channel Source']);

    const closedData = channels.map((item: any) => item.closed_challenges);
    const processingData = channels.map((item: any) => item.processing_challenges);
    const notClosedData = channels.map((item: any) => item.notClosed_challenges);

    this.createStackedHorizontalBarChart(
      this.challengesByChannelChartRef,
      'حالة الطلبات حسب القناة',
      labels,
      [
        { label: 'مغلقة', data: closedData, color: '#2DBE5C' },
        { label: 'قيد المعالجة', data: processingData, color: '#f59e0b' },
        { label: 'غير مغلقة', data: notClosedData, color: '#ef4444' },
      ]
    );
  }

  /**
   * Create main services column chart
   */
  private createMainServicesChart(data: any): void {
    if (!this.mainServicesChartRef || !Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createBarChart(this.mainServicesChartRef, 'توزيع الخدمات الرئيسية', labels, values);
  }

  /**
   * Create facilities column chart
   */
  private createFacilitiesChart(data: any): void {
    if (!this.facilitiesChartRef || !Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createBarChart(this.facilitiesChartRef, 'إجمالي الطلبات حسب القناة', labels, values);
  }

  /**
   * Create case origin sector pie chart
   */
  private createCaseOriginSectorChart(data: any): void {
    if (!this.caseOriginSectorChartRef || !Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createDoughnutChart(this.caseOriginSectorChartRef, 'توزيع الحالات حسب قطاع المنشأ', labels, values);
  }

  /**
   * Create bar chart
   */
  private createBarChart(
    chartRef: ElementRef,
    label: string,
    labels: string[],
    data: number[],
    colors: string[] = this.CHART_COLORS
  ): void {
    const ctx = chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  /**
   * Create horizontal bar chart
   */
  private createHorizontalBarChart(
    chartRef: ElementRef,
    label: string,
    labels: string[],
    data: number[]
  ): void {
    const ctx = chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: this.CHART_COLORS,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { beginAtZero: true },
        },
      },
    });
  }

  /**
   * Create stacked horizontal bar chart
   */
  private createStackedHorizontalBarChart(
    chartRef: ElementRef,
    title: string,
    labels: string[],
    datasets: Array<{ label: string; data: number[]; color: string }>
  ): void {
    const ctx = chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color,
        })),
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', display: true },
        },
        scales: {
          x: { beginAtZero: true, stacked: true },
          y: { stacked: true },
        },
      },
    });
  }

  /**
   * Create doughnut chart
   */
  private createDoughnutChart(
    chartRef: ElementRef,
    label: string,
    labels: string[],
    data: number[]
  ): void {
    const ctx = chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: this.CHART_COLORS,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  // ==================== CHAT METHODS ====================

  /**
   * Handle chat message from chat component
   */
  handleChatMessage(message: string): void {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.chatMessages.update((msgs) => [...msgs, userMessage]);
    this.chatError.set(null);

    this.isTyping.set(true);

    this.analysisService.sendChatMessage(message).subscribe({
      next: (response) => {
        this.isTyping.set(false);

        const messageContent = response.output || response.response;

        if (messageContent) {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: messageContent,
            timestamp: new Date(),
          };
          this.chatMessages.update((msgs) => [...msgs, botMessage]);
        } else {
          this.chatError.set('فشل الحصول على رد صالح من الخادم.');
        }

        setTimeout(() => this.scrollChatToBottom(), 100);
      },
      error: () => {
        this.isTyping.set(false);
        this.chatError.set('فشل الحصول على رد. يرجى المحاولة مرة أخرى.');
      },
    });
  }

  private scrollChatToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}
