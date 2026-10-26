import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MapComponent } from '../../components/map/map.component';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { BottomPanelComponent } from '../../components/bottom-panel/bottom-panel.component';
import { MapControlsComponent } from '../../components/map-controls/map-controls.component';
import { InfoPanelComponent } from '../../components/info-panel/info-panel.component';
import { GpsService } from '../../services/gps.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    MapComponent,
    TopBarComponent,
    SideMenuComponent,
    BottomPanelComponent,
    MapControlsComponent,
    InfoPanelComponent,
  ],
})
export class Home {
  private readonly msgs = inject(MessageService);
  private readonly gps = inject(GpsService);
}
