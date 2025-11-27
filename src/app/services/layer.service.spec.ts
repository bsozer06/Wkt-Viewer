import { TestBed } from '@angular/core/testing';
import { LayerService } from './layer.service';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

describe('LayerService', () => {
  let service: LayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GraphicsLayer Management', () => {
    it('should return initial GraphicsLayer instance', () => {
      const layer = service.getGraphicLayerInstance();
      expect(layer).toBeDefined();
      expect(layer).toBeInstanceOf(GraphicsLayer);
      expect(layer.title).toBe('Vector Layers');
    });

    it('should set and get GraphicsLayer', () => {
      const newLayer = new GraphicsLayer({ title: 'Test Layer' });
      service.setGraphicLayerInstance(newLayer);

      const retrievedLayer = service.getGraphicLayerInstance();
      expect(retrievedLayer).toBe(newLayer);
      expect(retrievedLayer.title).toBe('Test Layer');
    });

    it('should maintain GraphicsLayer reference', () => {
      const layer1 = service.getGraphicLayerInstance();
      const layer2 = service.getGraphicLayerInstance();
      expect(layer1).toBe(layer2);
    });
  });

  describe('Graphic Management', () => {
    it('should return initial Graphic instance', () => {
      const graphic = service.getGraphicInstance();
      expect(graphic).toBeDefined();
      expect(graphic).toBeInstanceOf(Graphic);
    });

    it('should set and get Graphic', () => {
      const newGraphic = new Graphic({
        geometry: {
          type: 'point',
          x: 32.8597,
          y: 39.9334,
        } as __esri.PointProperties,
      });
      service.setGraphicInstance(newGraphic);

      const retrievedGraphic = service.getGraphicInstance();
      expect(retrievedGraphic).toBe(newGraphic);
      expect(retrievedGraphic.geometry.type).toBe('point');
    });

    it('should maintain Graphic reference', () => {
      const graphic1 = service.getGraphicInstance();
      const graphic2 = service.getGraphicInstance();
      expect(graphic1).toBe(graphic2);
    });

    it('should update Graphic with different geometry types', () => {
      const pointGraphic = new Graphic({
        geometry: {
          type: 'point',
          x: 30,
          y: 10,
        } as __esri.PointProperties,
      });
      service.setGraphicInstance(pointGraphic);
      expect(service.getGraphicInstance().geometry.type).toBe('point');

      const polygonGraphic = new Graphic({
        geometry: {
          type: 'polygon',
          rings: [
            [
              [30, 10],
              [40, 40],
              [20, 40],
              [30, 10],
            ],
          ],
        } as __esri.PolygonProperties,
      });
      service.setGraphicInstance(polygonGraphic);
      expect(service.getGraphicInstance().geometry.type).toBe('polygon');
    });
  });

  describe('WKT Management', () => {
    it('should return empty string initially', () => {
      const wkt = service.getWkt();
      expect(wkt).toBe('');
    });

    it('should set and get WKT string', () => {
      const wktString = 'POINT (32.8597 39.9334)';
      service.setWkt(wktString);

      const retrievedWkt = service.getWkt();
      expect(retrievedWkt).toBe(wktString);
    });

    it('should handle LINESTRING WKT', () => {
      const wktString = 'LINESTRING (30 10, 10 30, 40 40)';
      service.setWkt(wktString);
      expect(service.getWkt()).toBe(wktString);
    });

    it('should handle POLYGON WKT', () => {
      const wktString = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
      service.setWkt(wktString);
      expect(service.getWkt()).toBe(wktString);
    });

    it('should handle MULTIPOINT WKT', () => {
      const wktString = 'MULTIPOINT ((10 40), (40 30), (20 20))';
      service.setWkt(wktString);
      expect(service.getWkt()).toBe(wktString);
    });

    it('should update WKT multiple times', () => {
      service.setWkt('POINT (30 10)');
      expect(service.getWkt()).toBe('POINT (30 10)');

      service.setWkt('POINT (40 20)');
      expect(service.getWkt()).toBe('POINT (40 20)');
    });

    it('should handle empty WKT string', () => {
      service.setWkt('POINT (30 10)');
      service.setWkt('');
      expect(service.getWkt()).toBe('');
    });
  });

  describe('EPSG Management', () => {
    it('should return empty string initially', () => {
      const epsg = service.getEpsg();
      expect(epsg).toBe('');
    });

    it('should set and get EPSG code', () => {
      const epsgCode = '4326';
      service.setEpsg(epsgCode);

      const retrievedEpsg = service.getEpsg();
      expect(retrievedEpsg).toBe(epsgCode);
    });

    it('should handle Web Mercator EPSG', () => {
      service.setEpsg('3857');
      expect(service.getEpsg()).toBe('3857');
    });

    it('should handle Turkish coordinate system EPSG', () => {
      service.setEpsg('5253');
      expect(service.getEpsg()).toBe('5253');
    });

    it('should update EPSG multiple times', () => {
      service.setEpsg('4326');
      expect(service.getEpsg()).toBe('4326');

      service.setEpsg('3857');
      expect(service.getEpsg()).toBe('3857');
    });

    it('should handle empty EPSG string', () => {
      service.setEpsg('4326');
      service.setEpsg('');
      expect(service.getEpsg()).toBe('');
    });
  });

  describe('Combined State Management', () => {
    it('should maintain independent state for WKT and EPSG', () => {
      service.setWkt('POINT (32.8597 39.9334)');
      service.setEpsg('4326');

      expect(service.getWkt()).toBe('POINT (32.8597 39.9334)');
      expect(service.getEpsg()).toBe('4326');
    });

    it('should maintain all states independently', () => {
      const wktString = 'POINT (30 10)';
      const epsgCode = '4326';
      const graphic = new Graphic({
        geometry: { type: 'point', x: 30, y: 10 } as __esri.PointProperties,
      });
      const layer = new GraphicsLayer({ title: 'Test' });

      service.setWkt(wktString);
      service.setEpsg(epsgCode);
      service.setGraphicInstance(graphic);
      service.setGraphicLayerInstance(layer);

      expect(service.getWkt()).toBe(wktString);
      expect(service.getEpsg()).toBe(epsgCode);
      expect(service.getGraphicInstance()).toBe(graphic);
      expect(service.getGraphicLayerInstance()).toBe(layer);
    });

    it('should update individual states without affecting others', () => {
      service.setWkt('POINT (30 10)');
      service.setEpsg('4326');

      service.setWkt('LINESTRING (30 10, 40 20)');

      expect(service.getWkt()).toBe('LINESTRING (30 10, 40 20)');
      expect(service.getEpsg()).toBe('4326'); // Should remain unchanged
    });
  });

  describe('Service Singleton', () => {
    it('should be provided as singleton', () => {
      const service2 = TestBed.inject(LayerService);
      expect(service2).toBe(service);
    });

    it('should maintain state across injections', () => {
      service.setWkt('POINT (30 10)');

      const service2 = TestBed.inject(LayerService);
      expect(service2.getWkt()).toBe('POINT (30 10)');
    });
  });
});
