import { Injectable } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private _graphic: Graphic;
  private _graphicLayer: GraphicsLayer;
  private _wkt = '';
  private _epsg = '';

  constructor() { 
    this._graphicLayer = new GraphicsLayer({ title: 'Vector Layers'});
    this._graphic = new Graphic();
  }

  public getGraphicLayerInstance(): GraphicsLayer {
    return this._graphicLayer;
  }

  public setGraphicLayerInstance(graphicLayer: GraphicsLayer): void {
    this._graphicLayer = graphicLayer;
  }

  public getGraphicInstance(): Graphic {
    return this._graphic;
  }

  public setGraphicInstance(graphic: Graphic): void {
    this._graphic = graphic;
  }

  public getWkt(): string {
    return this._wkt;
  }

  public setWkt(wkt: string): void {
    this._wkt = wkt;
  }

  public getEpsg(): string {
    return this._epsg;
  }

  public setEpsg(epsg: string): void {
    this._epsg = epsg;
  }
  
}
