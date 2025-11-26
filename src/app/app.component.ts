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

  // getEpsg(epsg: string) {
  //   console.log(epsg);
  //   this.epsg = epsg;

  // }

  // getWkt(wkt: string) {
  //   console.log(wkt);
  //   this.wkt = wkt;
  // }

  // getSelectedGraphic(graphic: Graphic) {
  //   this.selectedGraphic = graphic;
  //   // console.log("app:", graphic);
  //   // if (graphic?.geometry) {
  //   //   const convertedWkt = WktHelper.GeometryToWkt(graphic.geometry);
  //   //   // const selectedEpsg = graphic?.geometry?.spatialReference?.wkid;
  //   //   console.log('convertedWkt: ', convertedWkt, selectedEpsg);
  //   // }
  // }
}
