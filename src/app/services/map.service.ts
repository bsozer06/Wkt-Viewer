import { Injectable } from '@angular/core';
import Basemap from '@arcgis/core/Basemap';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import CoordinateConversion from '@arcgis/core/widgets/CoordinateConversion';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import { LayerService } from './layer.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _mapInstance?: Map;
  private _viewInstance?: MapView;

  constructor(private _layerService: LayerService) {}

  public initializeMap(mapViewId: string): void {
    const mapViewIdContainer = mapViewId;
    this._loadBaseMap(mapViewIdContainer);
    this._loadCoordinateConvertionTool();
    this._loadFullScreen();
  }

  public getMapInstance(): Map {
    return this._mapInstance ?? new Map();
  }

  public getViewInstance(): MapView {
    return this._viewInstance ?? new MapView();
  }

  private _loadBaseMap(mapViewId: string): void {
    const imageTileLayer = new VectorTileLayer({
      url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer',
    });

    const basemap = new Basemap({
      baseLayers: [imageTileLayer],
    });

    this._mapInstance = new Map({
      // basemap: 'streets-navigation-vector',
      // basemap: basemap
      basemap: {
        portalItem: {
          id: '8dda0e7b5e2d4fafa80132d59122268c', //Streets (WGS84)
        },
      },
    });

    this._viewInstance = new MapView({
      container: mapViewId,
      map: this._mapInstance,
      center: [32.8597, 39.9334],
      zoom: 4,
      // spatialReference: new SpatialReference({
      //   wkid: 4326
      // })
    });

    this._mapInstance.add(this._layerService.getGraphicLayerInstance());
  }

  private _loadCoordinateConvertionTool(): void {
    const ccWidget = new CoordinateConversion({
      view: this._viewInstance,
    });
    this._viewInstance?.ui.add(ccWidget, 'bottom-left');
  }

  private _loadFullScreen(): void {
    const fullscreen = new Fullscreen({
      view: this._viewInstance,
    });
    this._viewInstance?.ui.add(fullscreen, 'bottom-right');
  }
}
