import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent {
  @Input() summary: string | null = null;
  @Input() summaryError: string | null = null;
  @Input() isLoading: boolean = false;
  @Input() title: string = 'ملخص الملف';
  @Input() emptyTitle: string = 'لا يوجد ملخص متاح';
  @Input() emptyMessage: string = 'قم بتحميل ملف لإنشاء التقرير.';
  @Input() loadingMessage: string = 'جارٍ تحميل التقرير...';
}
