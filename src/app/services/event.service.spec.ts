import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import Graphic from '@arcgis/core/Graphic';
import { WktForm } from '../types/wktForm.type';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Graphic Change Events', () => {
    it('should emit graphic change', (done) => {
      const mockGraphic = new Graphic({
        geometry: {
          type: 'point',
          x: 32.8597,
          y: 39.9334,
        } as __esri.PointProperties,
      });

      service.getOnGraphicChange().subscribe((graphic) => {
        expect(graphic).toBe(mockGraphic);
        expect(graphic.geometry.type).toBe('point');
        done();
      });

      service.emitGraphicChange(mockGraphic);
    });

    it('should handle multiple graphic change emissions', (done) => {
      const graphics: Graphic[] = [];
      let count = 0;

      service.getOnGraphicChange().subscribe((graphic) => {
        graphics.push(graphic);
        count++;
        if (count === 3) {
          expect(graphics.length).toBe(3);
          done();
        }
      });

      service.emitGraphicChange(new Graphic());
      service.emitGraphicChange(new Graphic());
      service.emitGraphicChange(new Graphic());
    });

    it('should receive graphic with correct geometry type', (done) => {
      const mockGraphic = new Graphic({
        geometry: {
          type: 'polygon',
          rings: [
            [
              [30, 10],
              [40, 40],
              [20, 40],
              [10, 20],
              [30, 10],
            ],
          ],
        } as __esri.PolygonProperties,
      });

      service.getOnGraphicChange().subscribe((graphic) => {
        expect(graphic.geometry.type).toBe('polygon');
        done();
      });

      service.emitGraphicChange(mockGraphic);
    });
  });

  describe('WktForm Change Events', () => {
    it('should emit WktForm change', (done) => {
      const mockWktForm: WktForm = {
        wkt: 'POINT (32.8597 39.9334)',
        epsg: '4326',
      };

      service.getOnWktFormChange().subscribe((wktForm) => {
        expect(wktForm).toBe(mockWktForm);
        expect(wktForm.wkt).toBe('POINT (32.8597 39.9334)');
        expect(wktForm.epsg).toBe('4326');
        done();
      });

      service.emitWktFormChange(mockWktForm);
    });

    it('should handle WktForm with LINESTRING', (done) => {
      const mockWktForm: WktForm = {
        wkt: 'LINESTRING (30 10, 10 30, 40 40)',
        epsg: '3857',
      };

      service.getOnWktFormChange().subscribe((wktForm) => {
        expect(wktForm.wkt).toContain('LINESTRING');
        expect(wktForm.epsg).toBe('3857');
        done();
      });

      service.emitWktFormChange(mockWktForm);
    });

    it('should handle WktForm with POLYGON', (done) => {
      const mockWktForm: WktForm = {
        wkt: 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
        epsg: '4326',
      };

      service.getOnWktFormChange().subscribe((wktForm) => {
        expect(wktForm.wkt).toContain('POLYGON');
        done();
      });

      service.emitWktFormChange(mockWktForm);
    });

    it('should handle multiple WktForm emissions', (done) => {
      const wktForms: WktForm[] = [];
      let count = 0;

      service.getOnWktFormChange().subscribe((wktForm) => {
        wktForms.push(wktForm);
        count++;
        if (count === 2) {
          expect(wktForms.length).toBe(2);
          expect(wktForms[0].epsg).toBe('4326');
          expect(wktForms[1].epsg).toBe('3857');
          done();
        }
      });

      service.emitWktFormChange({ wkt: 'POINT (30 10)', epsg: '4326' });
      service.emitWktFormChange({ wkt: 'POINT (40 20)', epsg: '3857' });
    });

    it('should handle empty WKT string', (done) => {
      const mockWktForm: WktForm = {
        wkt: '',
        epsg: '4326',
      };

      service.getOnWktFormChange().subscribe((wktForm) => {
        expect(wktForm.wkt).toBe('');
        expect(wktForm.epsg).toBe('4326');
        done();
      });

      service.emitWktFormChange(mockWktForm);
    });
  });

  describe('Observable Subscriptions', () => {
    it('should allow multiple subscribers to graphic changes', () => {
      const mockGraphic = new Graphic();
      let subscriber1Called = false;
      let subscriber2Called = false;

      service.getOnGraphicChange().subscribe(() => {
        subscriber1Called = true;
      });

      service.getOnGraphicChange().subscribe(() => {
        subscriber2Called = true;
      });

      service.emitGraphicChange(mockGraphic);

      expect(subscriber1Called).toBe(true);
      expect(subscriber2Called).toBe(true);
    });

    it('should allow multiple subscribers to WktForm changes', () => {
      const mockWktForm: WktForm = { wkt: 'POINT (30 10)', epsg: '4326' };
      let subscriber1Called = false;
      let subscriber2Called = false;

      service.getOnWktFormChange().subscribe(() => {
        subscriber1Called = true;
      });

      service.getOnWktFormChange().subscribe(() => {
        subscriber2Called = true;
      });

      service.emitWktFormChange(mockWktForm);

      expect(subscriber1Called).toBe(true);
      expect(subscriber2Called).toBe(true);
    });

    it('should return Observable from getOnGraphicChange', () => {
      const observable = service.getOnGraphicChange();
      expect(observable).toBeDefined();
      expect(typeof observable.subscribe).toBe('function');
    });

    it('should return Observable from getOnWktFormChange', () => {
      const observable = service.getOnWktFormChange();
      expect(observable).toBeDefined();
      expect(typeof observable.subscribe).toBe('function');
    });
  });
});
