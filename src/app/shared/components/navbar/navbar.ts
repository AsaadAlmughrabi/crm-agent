import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Track which icon is active
  activeIcon = signal<string>('profile');

  setActiveIcon(icon: string) {
    this.activeIcon.set(icon);
  }
}
