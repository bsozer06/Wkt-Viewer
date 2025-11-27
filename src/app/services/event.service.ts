import { Injectable } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { Observable, Subject } from 'rxjs';
import { WktForm } from '../types/wktForm.type';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private _onGraphicChange: Subject<Graphic>;
  // private _onWktChange: Subject<string>;
  // private _onEpsgChange: Subject<string>;
  private _onWktFormChange: Subject<WktForm>;

  constructor() {
    this._onGraphicChange = new Subject();
    // this._onWktChange = new Subject();
    // this._onEpsgChange = new Subject();
    this._onWktFormChange = new Subject();
  }

  public getOnGraphicChange(): Observable<Graphic> {
    return this._onGraphicChange.asObservable();
  }
  public emitGraphicChange(graphic: Graphic): void {
    this._onGraphicChange.next(graphic);
  }
  // public getOnEpsgChange(): Observable<string> {
  //   return this._onEpsgChange.asObservable();
  // }
  // public getOnWktChange(): Observable<string> {
  //   return this._onWktChange.asObservable();
  // }
  public getOnWktFormChange(): Observable<WktForm> {
    return this._onWktFormChange.asObservable();
  }
  public emitWktFormChange(value: WktForm): void {
    this._onWktFormChange.next(value);
  }

  // public emitWktChange(wkt: string): void {
  //   this._onWktChange.next(wkt);
  // }
  // public emitEpsgChange(epsg: string): void {
  //   this._onEpsgChange.next(epsg);
  // }
}
