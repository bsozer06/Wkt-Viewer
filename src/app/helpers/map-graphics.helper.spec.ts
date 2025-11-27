import { MapGraphicsHelper } from './map-graphics.helper';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

describe('MapGraphicsHelper', () => {
  let graphicsLayer: GraphicsLayer;

  beforeEach(() => {
    graphicsLayer = new GraphicsLayer({ title: 'Test Layer' });
  });

  describe('addPointToGraphicLayer', () => {
    it('should add a point graphic to the layer', () => {
      const coords = [[32.8597, 39.9334]];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(graphicsLayer.graphics.length).toBe(1);
      expect(result?.geometry.type).toBe('point');
    });

    it('should set correct coordinates for the point', () => {
      const coords = [[32.8597, 39.9334]];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      const pointGeom = result?.geometry as __esri.Point;
      expect(pointGeom.x).toBe(32.8597);
      expect(pointGeom.y).toBe(39.9334);
      expect(pointGeom.spatialReference.wkid).toBe(4326);
    });

    it('should apply correct symbol styling', () => {
      const coords = [[32.8597, 39.9334]];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      const symbol = result?.symbol as __esri.SimpleMarkerSymbol;
      expect(symbol.type).toBe('simple-marker');
      expect(symbol.style).toBe('circle');
      expect(symbol.size).toBe(8);
    });

    it('should return null for empty coordinates array', () => {
      const coords: number[][] = [];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result).toBeNull();
      expect(graphicsLayer.graphics.length).toBe(0);
    });

    it('should return null for invalid coordinates', () => {
      const coords = [[32.8597]]; // Missing Y coordinate
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result).toBeNull();
    });

    it('should handle negative coordinates', () => {
      const coords = [[-122.4194, 37.7749]];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      const pointGeom = result?.geometry as __esri.Point;
      expect(pointGeom.x).toBe(-122.4194);
      expect(pointGeom.y).toBe(37.7749);
    });

    it('should work with different EPSG codes', () => {
      const coords = [[3658644, 4865942]];
      const epsg = 3857; // Web Mercator

      const result = MapGraphicsHelper.addPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result?.geometry.spatialReference.wkid).toBe(3857);
    });
  });

  describe('addLinestringToGraphicLayer', () => {
    it('should add a linestring graphic to the layer', () => {
      const coords = [
        [32.8597, 39.9334],
        [35.2433, 38.9637],
        [28.9784, 41.0082],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addLinestringToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result).toBeDefined();
      expect(graphicsLayer.graphics.length).toBe(1);
      expect(result.geometry.type).toBe('polyline');
    });

    it('should set correct path coordinates', () => {
      const coords = [
        [32.8597, 39.9334],
        [35.2433, 38.9637],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addLinestringToGraphicLayer(coords, epsg, graphicsLayer);

      const polylineGeom = result.geometry as __esri.Polyline;
      expect(polylineGeom.paths).toEqual([coords]);
      expect(polylineGeom.spatialReference.wkid).toBe(4326);
    });

    it('should apply correct line symbol styling', () => {
      const coords = [
        [32.8597, 39.9334],
        [35.2433, 38.9637],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addLinestringToGraphicLayer(coords, epsg, graphicsLayer);

      const symbol = result.symbol as __esri.SimpleLineSymbol;
      expect(symbol.type).toBe('simple-line');
      expect(symbol.width).toBe(4);
    });

    it('should handle single segment line', () => {
      const coords = [
        [32.8597, 39.9334],
        [35.2433, 38.9637],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addLinestringToGraphicLayer(coords, epsg, graphicsLayer);

      const polylineGeom = result.geometry as __esri.Polyline;
      expect(polylineGeom.paths[0].length).toBe(2);
    });

    it('should work with Web Mercator coordinates', () => {
      const coords = [
        [3658644, 4865942],
        [3924024, 4721671],
      ];
      const epsg = 3857;

      const result = MapGraphicsHelper.addLinestringToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result.geometry.spatialReference.wkid).toBe(3857);
    });
  });

  describe('addPolygonToGraphicLayer', () => {
    it('should add a polygon graphic to the layer', () => {
      const coords = [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPolygonToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result).toBeDefined();
      expect(graphicsLayer.graphics.length).toBe(1);
      expect(result.geometry.type).toBe('polygon');
    });

    it('should set correct ring coordinates', () => {
      const coords = [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPolygonToGraphicLayer(coords, epsg, graphicsLayer);

      const polygonGeom = result.geometry as __esri.Polygon;
      expect(polygonGeom.rings).toEqual([coords]);
      expect(polygonGeom.spatialReference.wkid).toBe(4326);
    });

    it('should apply correct fill and outline styling', () => {
      const coords = [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPolygonToGraphicLayer(coords, epsg, graphicsLayer);

      const symbol = result.symbol as __esri.SimpleFillSymbol;
      expect(symbol.type).toBe('simple-fill');
      expect(symbol.style).toBe('solid');
      expect(symbol.outline.width).toBe(3);
    });

    it('should handle complex polygon shapes', () => {
      const coords = [
        [32.8, 39.9],
        [32.9, 39.9],
        [32.9, 40.0],
        [32.8, 40.0],
        [32.8, 39.9],
      ];
      const epsg = 4326;

      const result = MapGraphicsHelper.addPolygonToGraphicLayer(coords, epsg, graphicsLayer);

      expect(result.geometry.type).toBe('polygon');
      expect(graphicsLayer.graphics.length).toBe(1);
    });
  });

  describe('addMultiPointToGraphicLayer', () => {
    it('should add multiple point graphics to the layer', () => {
      const coords = [
        [10, 40],
        [40, 30],
        [20, 20],
        [30, 10],
      ];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(graphicsLayer.graphics.length).toBe(4);
    });

    it('should create individual points with correct coordinates', () => {
      const coords = [
        [10, 40],
        [40, 30],
      ];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      const graphics = graphicsLayer.graphics.toArray();
      const point1 = graphics[0].geometry as __esri.Point;
      const point2 = graphics[1].geometry as __esri.Point;

      expect(point1.x).toBe(10);
      expect(point1.y).toBe(40);
      expect(point2.x).toBe(40);
      expect(point2.y).toBe(30);
    });

    it('should apply same symbol to all points', () => {
      const coords = [
        [10, 40],
        [40, 30],
        [20, 20],
      ];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      const graphics = graphicsLayer.graphics.toArray();
      graphics.forEach((graphic) => {
        const symbol = graphic.symbol as __esri.SimpleMarkerSymbol;
        expect(symbol.type).toBe('simple-marker');
        expect(symbol.style).toBe('circle');
        expect(symbol.size).toBe(8);
      });
    });

    it('should handle empty coordinates array', () => {
      const coords: number[][] = [];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(graphicsLayer.graphics.length).toBe(0);
    });

    it('should skip invalid coordinate pairs', () => {
      const coords = [
        [10, 40],
        [40], // Invalid - missing Y
        [20, 20],
      ];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      // Should only add valid points
      expect(graphicsLayer.graphics.length).toBe(2);
    });

    it('should handle single point', () => {
      const coords = [[32.8597, 39.9334]];
      const epsg = 4326;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      expect(graphicsLayer.graphics.length).toBe(1);
      const point = graphicsLayer.graphics.getItemAt(0).geometry as __esri.Point;
      expect(point.x).toBe(32.8597);
      expect(point.y).toBe(39.9334);
    });

    it('should work with different spatial references', () => {
      const coords = [
        [3658644, 4865942],
        [3924024, 4721671],
      ];
      const epsg = 3857;

      MapGraphicsHelper.addMultiPointToGraphicLayer(coords, epsg, graphicsLayer);

      const graphics = graphicsLayer.graphics.toArray();
      graphics.forEach((graphic) => {
        expect(graphic.geometry.spatialReference.wkid).toBe(3857);
      });
    });
  });
});
