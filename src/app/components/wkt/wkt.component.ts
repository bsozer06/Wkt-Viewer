import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import Graphic from '@arcgis/core/Graphic';
import { Subscription } from 'rxjs';
import { WktHelper } from 'src/app/helpers/wkt.helper';
import { EventService } from 'src/app/services/event.service';
import { WktForm } from 'src/app/types/wktForm.type';

@Component({
  selector: 'app-wkt',
  templateUrl: './wkt.component.html',
  styleUrls: ['./wkt.component.scss']
})
export class WktComponent implements OnInit, OnDestroy {
  selectedGraphic!: Graphic;
  wktFormVal:WktForm = {} as WktForm;

  private _subscriptions: Subscription[] = [];

  constructor(private _eventService: EventService) { }

  ngOnInit(): void {
    this._subscriptions.push(
        this._eventService.getOnGraphicChange().subscribe(g => {
        this.selectedGraphic = g;
        this.wktFormVal.wkt = WktHelper.GeometryToWkt(g.geometry);
        this.wktFormVal.epsg = g.geometry.spatialReference.wkid.toString();
      })
    );
  }
  
  ngOnDestroy(): void {
    this._subscriptions.forEach(x => x.unsubscribe());
  
  }

  public onSubmit(form: NgForm): void {
    // todo: refactorying
    if(form.dirty || form.touched) {
      console.log(form.status);
      if(form?.value.epsg != '' || form?.value.wkt != '') {
        this._eventService.emitWktFormChange(form.value as WktForm);
      } else {
        // todo: update
       window.alert('WKT or EPSG should not be empty!');
      }
    } else {
      if(this.wktFormVal?.wkt && this.wktFormVal?.epsg) {
        form.setValue(this.wktFormVal);
        this._eventService.emitWktFormChange(form.value as WktForm);
      } else {
        // todo: update
        window.alert('WKT or EPSG should not be empty!');
      }
    }

    console.log('onSubmit', this.wktFormVal);
  }

}
