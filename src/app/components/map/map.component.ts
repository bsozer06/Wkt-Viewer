import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { WktHelper } from 'src/app/helpers/wkt.helper';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Sketch from '@arcgis/core/widgets/Sketch';
import { MapService } from 'src/app/services/map.service';
import { LayerService } from 'src/app/services/layer.service';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';
import { WktForm } from 'src/app/types/wktForm.type';
import * as projection from '@arcgis/core/geometry/projection';
import Point from '@arcgis/core/geometry/Point.js';
import { ProjectionHelper } from 'src/app/helpers/projection.helper';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  wktForm = {} as WktForm;
  graphic?: Graphic;
  map!: Map;
  view!: MapView;
  graphicLayer!: GraphicsLayer;
  sketch?: Sketch;
  private _subscription: Subscription[] = [];
  private _isEditMode = false;
  private _shouldAutoEdit = false;

  constructor(
    private _mapService: MapService,
    private _layerService: LayerService,
    private _eventService: EventService
  ) {
    this._subscription.push(
      this._eventService.getOnWktFormChange().subscribe((val) => {
        this.wktForm.epsg = val.epsg;
        this.wktForm.wkt = val.wkt;
        this.addGraphicsToMap(val, val.autoEdit || false);
        console.log('map comp: getOnWktFormChange', val);
      })
    );
  }

  /// TODO: proj4 üzerinden her coord 3857 'ye donusturuelcek !!!

  ngOnDestroy(): void {
    this._subscription.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit(): void {
    this._mapService.initializeMap('mapViewDiv');
    this.graphicLayer = this._layerService.getGraphicLayerInstance();
    this.map = this._mapService.getMapInstance();
    this.view = this._mapService.getViewInstance();

    this._loadSketchTool();
    // this._testLoadingPolygonData();

    console.log('map comp:', this.wktForm);
    ProjectionHelper.ConvertTest();
  }

  // ngOnChanges removed; component does not rely on change detection hooks here

  public addGraphicsToMap(wktForm: WktForm, autoEdit = false): void {
    const wkt = (wktForm?.wkt || '').trim();
    // If WKT is empty, just clear and exit
    if (!wkt) {
      if (this.graphicLayer) {
        this.graphicLayer.removeAll();
      }
      this._eventService.emitGraphicChange(undefined as any);
      this._shouldAutoEdit = false;
      return;
    }

    // Set auto-edit flag only when explicitly requested
    this._shouldAutoEdit = autoEdit;

    // Clear previous graphics on each update
    if (this.graphicLayer) {
      this.graphicLayer.removeAll();
    }
    const geomType = WktHelper.GetGeomType(wkt);
    let coordsArr = WktHelper.WktToCoordArray(wkt);
    // Attempt reprojection to map SR if EPSG differs
    const targetEpsg = this.view.spatialReference?.wkid?.toString() || '3857';
    let finalEpsg = Number(wktForm.epsg);
    if (wktForm.epsg && targetEpsg && wktForm.epsg !== targetEpsg) {
      coordsArr = ProjectionHelper.ReprojectCoords(
        coordsArr as number[][],
        wktForm.epsg,
        targetEpsg
      );
      finalEpsg = Number(targetEpsg);
    }
    console.log('addGraphicsToMap', geomType, coordsArr);
    switch (geomType) {
      case 'POLYGON':
        this._addPolygonToGraphicLayer(coordsArr, finalEpsg);
        break;
      case 'LINESTRING':
        this._addLinestringToGraphicLayer(coordsArr, finalEpsg);
        break;
      case 'POINT':
        this._addPointToGraphicLayer(coordsArr, finalEpsg);
        break;
      case 'MULTIPOINT':
        this._addMultiPointToGraphicLayer(coordsArr, finalEpsg);
        break;
      default:
        // Unknown or unsupported type: do not add
        break;
    }
  }

  private _addPolygonToGraphicLayer(coordsArr: any[], epsg: number): void {
    const polygon = {
      type: 'polygon',
      rings: coordsArr,
      spatialReference: new SpatialReference({ wkid: epsg }),
    };
    const symbol = {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [186, 46, 34, 0.5],
      style: 'solid',
      outline: {
        // autocasts as new SimpleLineSymbol()
        color: 'red',
        width: 3,
      },
    };
    const polygonGraphic = new Graphic({
      geometry: polygon as __esri.GeometryProperties,
      visible: true,
      symbol: symbol,
    });
    polygonGraphic.geometry.spatialReference = new SpatialReference({ wkid: epsg });

    this.graphicLayer.add(polygonGraphic);
    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(polygonGraphic);
    this._eventService.emitGraphicChange(polygonGraphic);

    // Enable editing on the imported graphic only if requested
    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(polygonGraphic);
    }
  }
  private _addLinestringToGraphicLayer(coordsArr: any[], epsg: number): void {
    debugger;
    const linestring = {
      type: 'polyline',
      paths: coordsArr,
      spatialReference: new SpatialReference({ wkid: epsg }),
    };
    const lineSymbol = {
      type: 'simple-line', // autocasts as new SimpleLineSymbol()
      color: [226, 119, 40], // RGB color values as an array
      width: 4,
    };
    const polylineGraphic = new Graphic({
      geometry: linestring as __esri.GeometryProperties,
      visible: true,
      symbol: lineSymbol,
    });
    polylineGraphic.geometry.spatialReference = new SpatialReference({ wkid: epsg });

    this.graphicLayer.add(polylineGraphic);
    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(polylineGraphic);
    this._eventService.emitGraphicChange(polylineGraphic);

    // Enable editing on the imported graphic only if requested
    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(polylineGraphic);
    }
  }

  private _addPointToGraphicLayer(coordsArr: any[], epsg: number): void {
    const first = coordsArr?.[0];
    if (!first || first.length < 2) {
      return;
    }
    const point = {
      type: 'point',
      x: first[0],
      y: first[1],
      spatialReference: new SpatialReference({ wkid: epsg }),
    } as __esri.PointProperties;

    const markerSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: [0, 122, 255, 1],
      size: 8,
      outline: { color: [255, 255, 255, 1], width: 2 },
    } as __esri.SimpleMarkerSymbolProperties;

    const pointGraphic = new Graphic({
      geometry: point,
      visible: true,
      symbol: markerSymbol,
    });

    this.graphicLayer.add(pointGraphic);
    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(pointGraphic);
    this._eventService.emitGraphicChange(pointGraphic);

    // Enable editing on the imported graphic only if requested
    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(pointGraphic);
    }
  }

  private _addMultiPointToGraphicLayer(coordsArr: any[], epsg: number): void {
    if (!coordsArr || coordsArr.length === 0) {
      return;
    }

    // Create a marker symbol for all points
    const markerSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: [0, 122, 255, 1],
      size: 8,
      outline: { color: [255, 255, 255, 1], width: 2 },
    } as __esri.SimpleMarkerSymbolProperties;

    // Add each point as a separate graphic
    coordsArr.forEach((coord: number[]) => {
      if (coord && coord.length >= 2) {
        const point = {
          type: 'point',
          x: coord[0],
          y: coord[1],
          spatialReference: new SpatialReference({ wkid: epsg }),
        } as __esri.PointProperties;

        const pointGraphic = new Graphic({
          geometry: point,
          visible: true,
          symbol: markerSymbol,
        });

        this.graphicLayer.add(pointGraphic);
      }
    });

    this._layerService.setGraphicLayerInstance(this.graphicLayer);
  }

  // private _testLoadingPolygonData(): any {
  //   const poly = {
  //     type: "polygon",
  //     rings: [
  //       [
  //         [-129.14454, 35.774217],
  //         [-110.338423, 35.916706],
  //         [-122.729369, 27.245914],
  //         [-126.244531, 32.055647],
  //         [-129.14454, 35.774217]
  //       ]
  //     ]
  //   };
  //   const symbolPol = {
  //     type: "simple-fill",
  //     color: [227, 139, 79, 0.8],
  //     outline: {
  //       color: [255, 255, 255],
  //       width: 1
  //     }
  //   }
  //   const polygonGraphic = new Graphic({
  //     geometry: poly as __esri.GeometryProperties,
  //     symbol: symbolPol
  //   });
  //   polygonGraphic.geometry.spatialReference = new SpatialReference({
  //     wkid: 4326
  //   });
  //   this.graphicLayer.add(polygonGraphic);
  // }

  private _loadSketchTool(): void {
    this.view.when(() => {
      this.sketch = new Sketch({
        layer: this.graphicLayer,
        view: this.view,
        // graphic will be selected as soon as it is created
        creationMode: 'update',
      });
      this.sketch.on('create', (e) => {
        if (e.state === 'start') {
          this._isEditMode = true;
        } else if (e.state === 'complete') {
          this._isEditMode = false;
          this._layerService.setGraphicInstance(e.graphic);
          this._eventService.emitGraphicChange(e.graphic);
        }
      });
      this.sketch.on('update', (e) => {
        if (e.state === 'start') {
          this._isEditMode = true;
        } else if (e.state === 'complete') {
          this._isEditMode = false;
          this._layerService.setGraphicInstance(e.graphics[0]);
          this._eventService.emitGraphicChange(e.graphics[0]);
        }
      });

      this.view.ui.add(this.sketch, 'top-right');
    });
  }

  private _enableEditingOnGraphic(graphic: Graphic): void {
    // İçe aktarılan grafiği otomatik olarak edit moduna al
    // Ancak kullanıcı zaten edit modundaysa müdahale etme
    if (this.sketch && graphic && !this._isEditMode) {
      this.view.when(() => {
        setTimeout(() => {
          if (this.sketch && !this._isEditMode) {
            this._isEditMode = true;
            this.sketch.update([graphic], { tool: 'reshape' });
          }
        }, 100);
      });
    }
  }
}
