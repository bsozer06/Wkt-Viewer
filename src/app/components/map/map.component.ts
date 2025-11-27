import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { WktHelper } from 'src/app/helpers/wkt.helper';
import { MapGraphicsHelper } from 'src/app/helpers/map-graphics.helper';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Sketch from '@arcgis/core/widgets/Sketch';
import { MapService } from 'src/app/services/map.service';
import { LayerService } from 'src/app/services/layer.service';
import { EventService } from 'src/app/services/event.service';
import { Subscription } from 'rxjs';
import { WktForm } from 'src/app/types/wktForm.type';
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

  ngOnDestroy(): void {
    this._subscription.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit(): void {
    this._mapService.initializeMap('mapViewDiv');
    this.graphicLayer = this._layerService.getGraphicLayerInstance();
    this.map = this._mapService.getMapInstance();
    this.view = this._mapService.getViewInstance();

    this._loadSketchTool();
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
      this._eventService.emitGraphicChange(null as unknown as Graphic);
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

  private _addPolygonToGraphicLayer(coordsArr: number[][], epsg: number): void {
    const polygonGraphic = MapGraphicsHelper.addPolygonToGraphicLayer(
      coordsArr,
      epsg,
      this.graphicLayer
    );

    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(polygonGraphic);
    this._eventService.emitGraphicChange(polygonGraphic);

    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(polygonGraphic);
    }
  }
  private _addLinestringToGraphicLayer(coordsArr: number[][], epsg: number): void {
    const polylineGraphic = MapGraphicsHelper.addLinestringToGraphicLayer(
      coordsArr,
      epsg,
      this.graphicLayer
    );

    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(polylineGraphic);
    this._eventService.emitGraphicChange(polylineGraphic);

    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(polylineGraphic);
    }
  }

  private _addPointToGraphicLayer(coordsArr: number[][], epsg: number): void {
    const pointGraphic = MapGraphicsHelper.addPointToGraphicLayer(
      coordsArr,
      epsg,
      this.graphicLayer
    );

    if (!pointGraphic) {
      return;
    }

    this._layerService.setGraphicLayerInstance(this.graphicLayer);
    this._layerService.setGraphicInstance(pointGraphic);
    this._eventService.emitGraphicChange(pointGraphic);

    if (this._shouldAutoEdit) {
      this._enableEditingOnGraphic(pointGraphic);
    }
  }

  private _addMultiPointToGraphicLayer(coordsArr: number[][], epsg: number): void {
    MapGraphicsHelper.addMultiPointToGraphicLayer(coordsArr, epsg, this.graphicLayer);
    this._layerService.setGraphicLayerInstance(this.graphicLayer);
  }

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
