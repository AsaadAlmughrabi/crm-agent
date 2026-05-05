import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() chartsData: any = null;
  @Input() dataError: string | null = null;

  // Chart canvas refs
  @ViewChild('challengesByTypeChart') challengesByTypeChartRef?: ElementRef;
  @ViewChild('challengesByChannelChart') challengesByChannelChartRef?: ElementRef;
  @ViewChild('mainServicesChart') mainServicesChartRef?: ElementRef;
  @ViewChild('facilitiesChart') facilitiesChartRef?: ElementRef;
  @ViewChild('caseOriginSectorChart') caseOriginSectorChartRef?: ElementRef;

  // Individual loading states for charts/tables
  isLoadingSummary = signal(true);
  isLoadingByChannel = signal(true);
  isLoadingMonthly = signal(true);
  isLoadingByType = signal(true);
  isLoadingByOwner = signal(true);
  isLoadingMainServices = signal(true);
  isLoadingSubServices = signal(true);
  isLoadingFacilities = signal(true);
  isLoadingCaseOriginSector = signal(true);
  isLoadingCompletionDays = signal(true);
  isLoadingStatusCompletionDays = signal(true);

  // Monthly challenges table state
  selectedMonth = signal<string | null>(null);
  monthlyTableExpanded = signal(false);
  ownerTableExpanded = signal(false);
  subServicesTableExpanded = signal(false);
  completionDaysTableExpanded = signal(false);
  statusCompletionDaysTableExpanded = signal(false);

  // Chart instances
  private chartInstances: { [key: string]: Chart } = {};
  private chartsInitialized = false;

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

  ngAfterViewInit(): void {
    // Initialize charts if data is available
    if (this.chartsData) {
      // Set all loading states to false
      this.isLoadingSummary.set(false);
      this.isLoadingByChannel.set(false);
      this.isLoadingMonthly.set(false);
      this.isLoadingByType.set(false);
      this.isLoadingByOwner.set(false);
      this.isLoadingMainServices.set(false);
      this.isLoadingSubServices.set(false);
      this.isLoadingFacilities.set(false);
      this.isLoadingCaseOriginSector.set(false);
      this.isLoadingCompletionDays.set(false);
      this.isLoadingStatusCompletionDays.set(false);
      
      setTimeout(() => this.initializeCharts(), 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartsData'] && this.chartsData) {
      // Set all loading states to false
      this.isLoadingSummary.set(false);
      this.isLoadingByChannel.set(false);
      this.isLoadingMonthly.set(false);
      this.isLoadingByType.set(false);
      this.isLoadingByOwner.set(false);
      this.isLoadingMainServices.set(false);
      this.isLoadingSubServices.set(false);
      this.isLoadingFacilities.set(false);
      this.isLoadingCaseOriginSector.set(false);
      this.isLoadingCompletionDays.set(false);
      this.isLoadingStatusCompletionDays.set(false);
      
      // Destroy existing charts before reinitializing
      Object.values(this.chartInstances).forEach((chart) => chart.destroy());
      this.chartInstances = {};
      this.chartsInitialized = false;
      
      setTimeout(() => this.initializeCharts(), 100);
    }
  }

  private initializeCharts(): void {
    if (this.chartsInitialized) return;
    
    const data = this.chartsData;
    if (!data) return;

    console.log('Initializing charts with data:', data);

    // Create charts based on API response structure (matching dashboard)
    if (data.byType) {
      this.initializeChallengesByTypeChart();
    }

    if (data.byChannel) {
      this.initializeChallengesByChannelChart();
    }

    if (data.mainServices) {
      this.initializeMainServicesChart();
    }

    if (data.facilities) {
      this.initializeFacilitiesChart();
    }

    if (data.caseOriginSector) {
      this.initializeCaseOriginSectorChart();
    }

    // Set the first available month as selected for the monthly table
    if (data.monthly && !this.selectedMonth()) {
      const months = Object.keys(data.monthly).sort();
      if (months.length > 0) {
        this.selectedMonth.set(months[months.length - 1]); // Set to most recent month
      }
    }

    this.chartsInitialized = true;
  }

  private initializeCaseOriginSectorChart(): void {
    if (!this.caseOriginSectorChartRef?.nativeElement || !this.chartsData?.caseOriginSector) return;

    const data = this.chartsData.caseOriginSector;
    
    if (!Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createPieChart(this.caseOriginSectorChartRef, 'توزيع الحالات حسب قطاع المنشأ', labels, values);
  }

  private initializeChallengesByTypeChart(): void {
    if (!this.challengesByTypeChartRef?.nativeElement || !this.chartsData?.byType) return;

    const data = this.chartsData.byType;
    
    if (!data.type_distribution || !Array.isArray(data.type_distribution)) return;

    const labels = data.type_distribution.map((item: any) => item.type);
    const values = data.type_distribution.map((item: any) => item.count);

    this.createDoughnutChart(this.challengesByTypeChartRef, 'تصنيف الحالات حسب النوع', labels, values);
  }

  private initializeChallengesByChannelChart(): void {
    if (!this.challengesByChannelChartRef?.nativeElement || !this.chartsData?.byChannel) {
      return;
    }

    const data = this.chartsData.byChannel;
    
    // Expecting data structure: { data: [...] }
    if (!data.data || !Array.isArray(data.data)) {
      return;
    }

    const channels = data.data;
    const labels = channels.map((item: any) => item['Channel Source'] || item.channel || item.name || '');

    // Create datasets for stacked bar chart
    const closedData = channels.map((item: any) => item.closed_challenges || 0);
    const processingData = channels.map((item: any) => item.processing_challenges || 0);
    const notClosedData = channels.map((item: any) => item.notClosed_challenges || 0);

    const ctx = this.challengesByChannelChartRef.nativeElement.getContext('2d');

    if (this.chartInstances['byChannel']) {
      this.chartInstances['byChannel'].destroy();
    }

    this.chartInstances['byChannel'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'مغلقة',
            data: closedData,
            backgroundColor: '#2DBE5C',
          },
          {
            label: 'قيد المعالجة',
            data: processingData,
            backgroundColor: '#FFB44F',
          },
          {
            label: 'غير مغلقة',
            data: notClosedData,
            backgroundColor: '#ef4444',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            display: true,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }

  private initializeMainServicesChart(): void {
    if (!this.mainServicesChartRef?.nativeElement || !this.chartsData?.mainServices) return;

    const data = this.chartsData.mainServices;
    
    if (!Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createBarChart(this.mainServicesChartRef, 'توزيع الخدمات الرئيسية', labels, values);
  }

  private initializeFacilitiesChart(): void {
    if (!this.facilitiesChartRef?.nativeElement || !this.chartsData?.facilities) return;

    const data = this.chartsData.facilities;
    
    if (!Array.isArray(data)) return;

    const labels = data.map((item: any) => item.status);
    const values = data.map((item: any) => item.count);

    this.createBarChart(this.facilitiesChartRef, 'إجمالي الطلبات حسب القناة', labels, values);
  }

  // Monthly table methods
  getAvailableMonths(): string[] {
    const monthly = this.chartsData?.monthly;
    if (!monthly || typeof monthly !== 'object') return [];

    return Object.keys(monthly).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
  }

  selectMonth(month: string): void {
    this.selectedMonth.set(month);
    this.monthlyTableExpanded.set(false);
  }

  getMonthlyData(): any[] {
    const month = this.selectedMonth();
    if (!month || !this.chartsData?.monthly?.[month]) return [];
    return this.chartsData.monthly[month];
  }

  getLimitedMonthlyData(): any[] {
    if (this.monthlyTableExpanded()) {
      return this.getMonthlyData();
    }
    return this.getMonthlyData().slice(0, 5);
  }

  expandMonthlyTable(): void {
    this.monthlyTableExpanded.set(true);
  }

  hasMoreMonthlyRecords(): boolean {
    return !this.monthlyTableExpanded() && this.getMonthlyData().length > 5;
  }

  // Owner table methods
  getLimitedOwnerData(): any[] {
    const data = this.chartsData?.byOwner?.data || [];
    if (this.ownerTableExpanded()) {
      return data;
    }
    return data.slice(0, 5);
  }

  expandOwnerTable(): void {
    this.ownerTableExpanded.set(true);
  }

  hasMoreOwnerRecords(): boolean {
    const data = this.chartsData?.byOwner?.data || [];
    return !this.ownerTableExpanded() && data.length > 5;
  }

  // Sub-services table methods
  getLimitedSubServicesData(): any[] {
    const data = this.chartsData?.subServices || [];
    if (this.subServicesTableExpanded()) {
      return data;
    }
    return data.slice(0, 5);
  }

  expandSubServicesTable(): void {
    this.subServicesTableExpanded.set(true);
  }

  hasMoreSubServicesRecords(): boolean {
    const data = this.chartsData?.subServices || [];
    return !this.subServicesTableExpanded() && data.length > 5;
  }

  // Completion days table methods
  getLimitedCompletionDaysData(): any[] {
    const data = this.chartsData?.completionDays?.completion_data || [];
    if (this.completionDaysTableExpanded()) {
      return data;
    }
    return data.slice(0, 5);
  }

  expandCompletionDaysTable(): void {
    this.completionDaysTableExpanded.set(true);
  }

  hasMoreCompletionDaysRecords(): boolean {
    const data = this.chartsData?.completionDays?.completion_data || [];
    return !this.completionDaysTableExpanded() && data.length > 5;
  }

  // Status completion days table methods
  getLimitedStatusCompletionDaysData(): any[] {
    const data = this.chartsData?.statusCompletionDays || [];
    if (this.statusCompletionDaysTableExpanded()) {
      return data;
    }
    return data.slice(0, 5);
  }

  expandStatusCompletionDaysTable(): void {
    this.statusCompletionDaysTableExpanded.set(true);
  }

  hasMoreStatusCompletionDaysRecords(): boolean {
    const data = this.chartsData?.statusCompletionDays || [];
    return !this.statusCompletionDaysTableExpanded() && data.length > 5;
  }

  ngOnDestroy(): void {
    // Destroy all chart instances
    Object.values(this.chartInstances).forEach((chart) => chart.destroy());
  }

  // ==================== CHART CREATION HELPER METHODS (from dashboard) ====================

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
          y: {
            beginAtZero: true,
          },
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
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
            },
          },
        },
      },
    });
  }

  /**
   * Create pie chart
   */
  private createPieChart(
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
      type: 'pie',
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
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
            },
          },
        },
      },
    });
  }
}
