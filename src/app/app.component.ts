import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <main>
      <router-outlet />
    </main>
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
export class AppComponent {}
