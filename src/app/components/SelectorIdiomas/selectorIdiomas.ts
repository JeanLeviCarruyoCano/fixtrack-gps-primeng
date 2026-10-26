import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
interface Language {
  label: string;
  value: string;
  icon: string;
  description: string;
}
@Component({
  standalone: true,
  imports: [DropdownModule, FormsModule],
  selector: 'app-selector-idiomas',
  templateUrl: './selectorIdiomas.html',
  styles: [
    `
      :host {
        position: absolute;
        z-index: 20;
        top: 22px;
        right: max(24px, calc((100vw - 1040px) / 2));
      }

      .language-switch {
        width: 126px;
      }

      :host ::ng-deep .language-dropdown.p-dropdown {
        width: 100%;
        min-height: 38px;
        border: 1px solid rgba(219, 227, 238, 0.9);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.76);
        box-shadow: 0 4px 12px rgba(31, 56, 91, 0.04);
      }

      :host ::ng-deep .language-dropdown .p-dropdown-label {
        display: flex;
        align-items: center;
        padding: 0 10px;
        color: #52647d;
        font-size: 11px;
      }

      :host ::ng-deep .language-dropdown .p-dropdown-trigger {
        width: 2rem;
        color: #75859b;
      }

      .language-selected,
      .language-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .language-flag {
        font-size: 15px;
      }

      .language-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .language-name {
        color: #243750;
        font-size: 12px;
        font-weight: 600;
      }

      .language-description {
        color: #8491a3;
        font-size: 10px;
      }

      @media (max-width: 760px) {
        :host {
          top: 16px;
          right: 16px;
        }
      }
    `,
  ],
})
export class selectorIdiomas {
  languages = [
    { label: 'English', value: 'en', icon: '🇺🇸', description: 'English language' },
    { label: 'Deutsch', value: 'de', icon: '🇩🇪', description: 'German language' },
    { label: 'Español', value: 'es', icon: '🇪🇸', description: 'Idioma español' },
    { label: 'Français', value: 'fr', icon: '🇫🇷', description: 'French language' },
    { label: 'Italiano', value: 'it', icon: '🇮🇹', description: 'Italian language' },
  ];

  selectedLanguage: Language | undefined;
}
