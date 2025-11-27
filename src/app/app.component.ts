import { Component } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { WktHelper } from './helpers/wkt.helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public epsg = '';
  public wkt = '';
  public selectedGraphic!: Graphic;
  title = 'gis-viewer';
}
