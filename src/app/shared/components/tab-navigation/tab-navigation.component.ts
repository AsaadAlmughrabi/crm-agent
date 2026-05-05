import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'upload' | 'charts';

export interface Tab {
  id: TabType;
  label: string;
  icon: string;
  activeIcon: string;
}

@Component({
  selector: 'app-tab-navigation',
  imports: [CommonModule],
  templateUrl: './tab-navigation.component.html',
  styleUrl: './tab-navigation.component.css',
})
export class TabNavigationComponent {
  // Inputs
  activeTab = input.required<TabType>();
  tabs = input<Tab[]>([
    { id: 'upload', label: 'رفع الملف', icon: '/images/uploadOff.png', activeIcon: '/images/upload.png' },
    { id: 'charts', label: 'الرسوم البيانية', icon: '/images/charts.png', activeIcon: '/images/chartsOn.png' },
  ]);

  // Output
  tabChange = output<TabType>();

  onTabClick(tabId: TabType): void {
    this.tabChange.emit(tabId);
  }
}
