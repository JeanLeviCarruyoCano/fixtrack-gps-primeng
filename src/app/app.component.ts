import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UsabilityTrackingService } from './usability/usability-tracking.service';
import { ModeratorPanelComponent } from './usability/moderator-panel.component';
import { SusQuestionnaireComponent } from './usability/sus-questionnaire.component';
import { AppPanelsComponent } from './settings/app-panels.component';
import { SettingsService } from './settings/settings.service';
import { UiPanelService } from './settings/ui-panel.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModeratorPanelComponent, SusQuestionnaireComponent, AppPanelsComponent],
  template: `
    <main>
      <router-outlet />
    </main>
    @defer (when panels.open() !== null) {
      <app-panels></app-panels>
    }
    @if (usability.enabled()) {
      @defer (on immediate) {
        <app-moderator-panel></app-moderator-panel>
        <app-sus-questionnaire></app-sus-questionnaire>
      }
    }
  `,
  styles: [
    `
      .app-shell {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background: #0b1220;
      }
    `,
  ],
})
export class AppComponent {
  readonly usability = inject(UsabilityTrackingService);
  readonly panels = inject(UiPanelService);
  private readonly settings = inject(SettingsService);
}
