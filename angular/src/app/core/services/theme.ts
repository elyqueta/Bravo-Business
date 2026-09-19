import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'bravo_theme';
  private themeSubject = new BehaviorSubject<Theme>(this.loadTheme());
  readonly theme$ = this.themeSubject.asObservable();

  get current(): Theme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  toggle(): void {
    const next = this.themeSubject.value === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.STORAGE_KEY, next);
    this.themeSubject.next(next);
    this.apply(next);
  }

  init(): void {
    this.apply(this.themeSubject.value);
  }

  private loadTheme(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) || 'light';
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
