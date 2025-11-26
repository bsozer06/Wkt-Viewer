import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Graphic from '@arcgis/core/Graphic';
import { Subscription } from 'rxjs';
import { WktHelper } from 'src/app/helpers/wkt.helper';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { WktForm } from 'src/app/types/wktForm.type';

@Component({
  selector: 'app-wkt',
  templateUrl: './wkt.component.html',
  styleUrls: ['./wkt.component.scss'],
})
export class WktComponent implements OnInit, OnDestroy {
  selectedGraphic!: Graphic;
  wktFormVal: WktForm = {} as WktForm;
  form!: FormGroup;
  epsgOptions = [
    { value: '4326', label: 'EPSG:4326 — WGS 84 (lat/lon)' },
    { value: '3857', label: 'EPSG:3857 — Web Mercator' },
    { value: '102100', label: 'EPSG:102100 — Web Mercator (Aux)' },
    { value: '27700', label: 'EPSG:27700 — OSGB36 / British National Grid' },
  ];
  isDragging = false;
  features: any[] = [];
  selectedFeatureIndex = 0;

  private _subscriptions: Subscription[] = [];

  constructor(
    private _eventService: EventService,
    private _mapService: MapService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      wkt: ['', [Validators.required]],
      epsg: ['', [Validators.required, Validators.pattern(/^\d{3,5}$/)]],
    });

    // Live preview: emit when valid with debounce
    this._subscriptions.push(
      this.form.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
        if (this.form.valid) {
          const value = this.form.value as WktForm;
          value.autoEdit = false; // Form değişikliklerinde otomatik edit moduna geçme
          this._eventService.emitWktFormChange(value);
        }
      })
    );

    this._subscriptions.push(
      this._eventService.getOnGraphicChange().subscribe((g) => {
        this.selectedGraphic = g;
        this.wktFormVal.wkt = WktHelper.GeometryToWkt(g.geometry);
        this.wktFormVal.epsg = g.geometry.spatialReference.wkid.toString();
        this.form.patchValue({ wkt: this.wktFormVal.wkt, epsg: this.wktFormVal.epsg });
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((x) => x.unsubscribe());
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value as WktForm;
    this._eventService.emitWktFormChange(value);
  }

  public pasteSample(type: 'polygon' | 'line' | 'point'): void {
    const samples = {
      polygon: 'POLYGON ((-10 46, -12 34, -14 20, -10 46))',
      line: 'LINESTRING (-10 46, -12 34, -14 20)',
      point: 'POINT (-10 46)',
    } as const;
    this.form.patchValue({ wkt: samples[type] });
    // Sample paste edildiğinde otomatik edit modu aktif olsun
    setTimeout(() => {
      const value = this.form.value as WktForm;
      value.autoEdit = true;
      this._eventService.emitWktFormChange(value);
    }, 50);
  }

  public copyWktToClipboard(): void {
    const wkt = this.form.get('wkt')?.value || '';
    if (!wkt) return;
    navigator.clipboard?.writeText(wkt).catch(() => {
      /* ignore */
    });
  }

  public clearAll(): void {
    this.form.reset();
    // Explicitly notify to clear map when form is empty
    this._eventService.emitWktFormChange({ wkt: '', epsg: '' } as WktForm);
  }

  public useMapSpatialReference(): void {
    const wkid = this._mapService.getViewInstance()?.spatialReference?.wkid?.toString() || '3857';
    this.form.patchValue({ epsg: wkid });
  }

  // File import handlers
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this._processFile(files[0]);
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._processFile(input.files[0]);
    }
  }

  private _processFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        this._parseFileContent(content, file.name);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to read file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      alert('Error reading file.');
    };

    reader.readAsText(file);
  }

  private _parseFileContent(content: string, fileName: string): void {
    try {
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (extension === 'wkt' || extension === 'txt') {
        // Direct WKT content
        const wkt = content.trim();
        this.form.patchValue({ wkt });
        this.features = [];
        // Dosya import edildiğinde otomatik edit moduna geç
        setTimeout(() => {
          const value = this.form.value as WktForm;
          value.autoEdit = true;
          this._eventService.emitWktFormChange(value);
        }, 50);
      } else if (extension === 'geojson' || extension === 'json') {
        // Parse GeoJSON
        const geoJson = JSON.parse(content);

        // Handle FeatureCollection
        if (geoJson.type === 'FeatureCollection' && geoJson.features?.length > 0) {
          // Store all features
          this.features = geoJson.features.map((feature: any, index: number) => ({
            original: feature,
            name: feature.properties?.name || feature.id || `Feature ${index + 1}`,
            id: feature.id || `feature-${index}`,
            type: feature.geometry?.type || 'Unknown',
          }));

          // If all features are Points, show as MULTIPOINT
          if (this.areAllFeaturesPoints()) {
            this._showAllPointsAsMultiPoint();
            // Don't show navigation for MULTIPOINT
          } else {
            // Show first feature for non-Point collections
            this.selectedFeatureIndex = 0;
            this.selectFeature(0);
          }
        } else {
          // Single Feature
          const result = WktHelper.GeoJSONToWkt(geoJson);
          this.form.patchValue({ wkt: result.wkt });
          if (result.epsg) {
            this.form.patchValue({ epsg: result.epsg });
          }
          this.features = [];
          // Dosya import edildiğinde otomatik edit moduna geç
          setTimeout(() => {
            const value = this.form.value as WktForm;
            value.autoEdit = true;
            this._eventService.emitWktFormChange(value);
          }, 50);
        }
      } else {
        alert('Unsupported file format. Please use .wkt, .geojson, or .json files.');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Failed to parse file content. Please check the file format.');
    }
  }

  public selectFeature(index: number): void {
    if (index < 0 || index >= this.features.length) return;

    this.selectedFeatureIndex = index;
    const feature = this.features[index].original;

    try {
      const result = WktHelper.GeoJSONToWkt(feature);
      this.form.patchValue({ wkt: result.wkt });
      if (result.epsg && !this.form.get('epsg')?.value) {
        this.form.patchValue({ epsg: result.epsg });
      }
      // Feature seçildiğinde otomatik edit moduna geç
      setTimeout(() => {
        const value = this.form.value as WktForm;
        value.autoEdit = true;
        this._eventService.emitWktFormChange(value);
      }, 50);
    } catch (error) {
      console.error('Error converting feature to WKT:', error);
    }
  }

  public areAllFeaturesPoints(): boolean {
    return this.features.length > 0 && this.features.every((f) => f.type === 'Point');
  }

  private _showAllPointsAsMultiPoint(): void {
    try {
      const allFeatures = this.features.map((f) => f.original);
      const result = WktHelper.FeaturesToMultiPointWkt(allFeatures);
      this.form.patchValue({ wkt: result.wkt });
      if (result.epsg && !this.form.get('epsg')?.value) {
        this.form.patchValue({ epsg: result.epsg });
      }
      // MultiPoint gösterildiğinde otomatik edit moduna geç
      setTimeout(() => {
        const value = this.form.value as WktForm;
        value.autoEdit = true;
        this._eventService.emitWktFormChange(value);
      }, 50);
    } catch (error) {
      console.error('Error converting features to MULTIPOINT:', error);
    }
  }

  public previousFeature(): void {
    if (this.selectedFeatureIndex > 0) {
      this.selectFeature(this.selectedFeatureIndex - 1);
    }
  }

  public nextFeature(): void {
    if (this.selectedFeatureIndex < this.features.length - 1) {
      this.selectFeature(this.selectedFeatureIndex + 1);
    }
  }

  // Export handlers
  public exportAsWkt(): void {
    const wkt = this.form.get('wkt')?.value;
    if (!wkt) return;

    const blob = new Blob([wkt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geometry_${new Date().getTime()}.wkt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  public exportAsGeoJSON(): void {
    const wkt = this.form.get('wkt')?.value;
    const epsg = this.form.get('epsg')?.value;
    if (!wkt) return;

    try {
      const geoJson = WktHelper.WktToGeoJSON(wkt, epsg);
      const content = JSON.stringify(geoJson, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geometry_${new Date().getTime()}.geojson`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting to GeoJSON:', error);
      alert('Failed to convert to GeoJSON. Please check your WKT format.');
    }
  }
}
