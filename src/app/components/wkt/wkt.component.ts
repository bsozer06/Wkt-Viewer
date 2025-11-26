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
          this._eventService.emitWktFormChange(this.form.value as WktForm);
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
}
