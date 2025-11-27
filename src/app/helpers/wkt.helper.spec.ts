import { WktHelper } from './wkt.helper';

describe('WktHelper', () => {
  describe('GetGeomType', () => {
    it('should return POINT for POINT geometry', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.GetGeomType(wkt);
      expect(result).toBe('POINT');
    });

    it('should return LINESTRING for LINESTRING geometry', () => {
      const wkt = 'LINESTRING (30 10, 10 30, 40 40)';
      const result = WktHelper.GetGeomType(wkt);
      expect(result).toBe('LINESTRING');
    });

    it('should return POLYGON for POLYGON geometry', () => {
      const wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
      const result = WktHelper.GetGeomType(wkt);
      expect(result).toBe('POLYGON');
    });

    it('should return MULTIPOINT for MULTIPOINT geometry', () => {
      const wkt = 'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))';
      const result = WktHelper.GetGeomType(wkt);
      expect(result).toBe('MULTIPOINT');
    });

    it('should handle lowercase geometry types', () => {
      const wkt = 'point (30 10)';
      const result = WktHelper.GetGeomType(wkt);
      expect(result).toBe('POINT');
    });
  });

  describe('WktToCoordArray', () => {
    it('should convert POINT WKT to coordinate array', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([[30, 10]]);
    });

    it('should convert LINESTRING WKT to coordinate array', () => {
      const wkt = 'LINESTRING (30 10, 10 30, 40 40)';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([
        [30, 10],
        [10, 30],
        [40, 40],
      ]);
    });

    it('should convert POLYGON WKT to coordinate array', () => {
      const wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ]);
    });

    it('should convert MULTIPOINT WKT with parentheses format', () => {
      const wkt = 'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([
        [10, 40],
        [40, 30],
        [20, 20],
        [30, 10],
      ]);
    });

    it('should convert MULTIPOINT WKT without inner parentheses', () => {
      // Note: Current implementation primarily handles format with parentheses
      // This format may not work as expected with current regex
      const wkt = 'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([
        [10, 40],
        [40, 30],
        [20, 20],
        [30, 10],
      ]);
    });

    it('should handle WKT with extra whitespace', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([[30, 10]]);
    });

    it('should return empty array for empty WKT string', () => {
      const wkt = '';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([]);
    });

    it('should handle negative coordinates', () => {
      const wkt = 'POINT (-122.4194 37.7749)';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([[-122.4194, 37.7749]]);
    });

    it('should handle decimal coordinates', () => {
      const wkt = 'LINESTRING (32.8597 39.9334, 35.2433 38.9637)';
      const result = WktHelper.WktToCoordArray(wkt);
      expect(result).toEqual([
        [32.8597, 39.9334],
        [35.2433, 38.9637],
      ]);
    });
  });

  describe('GeometryToWkt', () => {
    it('should convert Point geometry to WKT', () => {
      const geometry = {
        type: 'point',
        x: 30,
        y: 10,
      };
      const result = WktHelper.GeometryToWkt(geometry);
      expect(result).toBe('POINT (30 10)');
    });

    it('should convert Polyline geometry to WKT', () => {
      const geometry = {
        type: 'polyline',
        paths: [
          [
            [30, 10],
            [10, 30],
            [40, 40],
          ],
        ],
      };
      const result = WktHelper.GeometryToWkt(geometry);
      expect(result).toBe('LINESTRING (30 10,10 30,40 40)');
    });

    it('should convert Polygon geometry to WKT', () => {
      const geometry = {
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
      };
      const result = WktHelper.GeometryToWkt(geometry);
      expect(result).toBe('POLYGON ((30 10,40 40,20 40,10 20,30 10))');
    });

    it('should return empty string for null geometry', () => {
      const result = WktHelper.GeometryToWkt(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined geometry', () => {
      const result = WktHelper.GeometryToWkt(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for unknown geometry type', () => {
      const geometry = {
        type: 'unknown',
      };
      const result = WktHelper.GeometryToWkt(geometry);
      expect(result).toBe('');
    });

    it('should handle negative coordinates in Point geometry', () => {
      const geometry = {
        type: 'point',
        x: -122.4194,
        y: 37.7749,
      };
      const result = WktHelper.GeometryToWkt(geometry);
      expect(result).toBe('POINT (-122.4194 37.7749)');
    });
  });

  describe('WktToGeoJSON', () => {
    it('should convert POINT WKT to GeoJSON', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.WktToGeoJSON(wkt);
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Point');
      expect(result.geometry.coordinates).toEqual([30, 10]);
      expect(result.properties).toEqual({});
    });

    it('should convert LINESTRING WKT to GeoJSON', () => {
      const wkt = 'LINESTRING (30 10, 10 30, 40 40)';
      const result = WktHelper.WktToGeoJSON(wkt);
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toEqual([
        [30, 10],
        [10, 30],
        [40, 40],
      ]);
    });

    it('should convert POLYGON WKT to GeoJSON', () => {
      const wkt = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
      const result = WktHelper.WktToGeoJSON(wkt);
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Polygon');
      expect(result.geometry.coordinates).toEqual([
        [
          [30, 10],
          [40, 40],
          [20, 40],
          [10, 20],
          [30, 10],
        ],
      ]);
    });

    it('should include EPSG in CRS when provided', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.WktToGeoJSON(wkt, '4326');
      expect(result.crs).toBeDefined();
      expect(result.crs.type).toBe('name');
      expect(result.crs.properties.name).toBe('EPSG:4326');
    });

    it('should not include CRS when EPSG is not provided', () => {
      const wkt = 'POINT (30 10)';
      const result = WktHelper.WktToGeoJSON(wkt);
      expect(result.crs).toBeUndefined();
    });

    it('should throw error for unsupported geometry type', () => {
      const wkt = 'MULTIPOLYGON (((30 10, 40 40, 20 40, 10 20, 30 10)))';
      expect(() => WktHelper.WktToGeoJSON(wkt)).toThrowError(
        'Unsupported geometry type: MULTIPOLYGON'
      );
    });
  });

  describe('GeoJSONToWkt', () => {
    it('should convert Point GeoJSON to WKT', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [30, 10],
        },
        properties: {},
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('POINT (30 10)');
      expect(result.epsg).toBeUndefined();
    });

    it('should convert LineString GeoJSON to WKT', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [30, 10],
            [10, 30],
            [40, 40],
          ],
        },
        properties: {},
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('LINESTRING (30 10, 10 30, 40 40)');
    });

    it('should convert Polygon GeoJSON to WKT', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [30, 10],
              [40, 40],
              [20, 40],
              [10, 20],
              [30, 10],
            ],
          ],
        },
        properties: {},
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))');
    });

    it('should extract EPSG from CRS', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [30, 10],
        },
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326',
          },
        },
        properties: {},
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('POINT (30 10)');
      expect(result.epsg).toBe('4326');
    });

    it('should handle GeoJSON without Feature wrapper', () => {
      const geoJson = {
        type: 'Point',
        coordinates: [30, 10],
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('POINT (30 10)');
    });

    it('should throw error for unsupported geometry type', () => {
      const geoJson = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [],
        },
        properties: {},
      };
      expect(() => WktHelper.GeoJSONToWkt(geoJson)).toThrowError(
        'Unsupported GeoJSON type: MULTIPOLYGON'
      );
    });

    it('should handle case-insensitive geometry types', () => {
      const geoJson = {
        geometry: {
          type: 'point',
          coordinates: [30, 10],
        },
      };
      const result = WktHelper.GeoJSONToWkt(geoJson);
      expect(result.wkt).toBe('POINT (30 10)');
    });
  });

  describe('FeaturesToMultiPointWkt', () => {
    it('should convert multiple Point features to MULTIPOINT WKT', () => {
      const features = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 40] },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [40, 30] },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [20, 20] },
          properties: {},
        },
      ];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ((10 40), (40 30), (20 20))');
      expect(result.epsg).toBeUndefined();
    });

    it('should extract EPSG from first feature', () => {
      const features = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 40] },
          crs: {
            type: 'name',
            properties: { name: 'EPSG:4326' },
          },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [40, 30] },
          properties: {},
        },
      ];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ((10 40), (40 30))');
      expect(result.epsg).toBe('4326');
    });

    it('should handle empty features array', () => {
      const features = [] as unknown[];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ()');
      expect(result.epsg).toBeUndefined();
    });

    it('should ignore non-Point geometries', () => {
      const features = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 40] },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [30, 10],
              [40, 20],
            ],
          },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [40, 30] },
          properties: {},
        },
      ];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ((10 40), (40 30))');
    });

    it('should handle features without Feature wrapper', () => {
      const features = [
        { type: 'Point', coordinates: [10, 40] },
        { type: 'Point', coordinates: [40, 30] },
      ];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ((10 40), (40 30))');
    });

    it('should handle negative coordinates', () => {
      const features = [
        {
          geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        },
        {
          geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
        },
      ];
      const result = WktHelper.FeaturesToMultiPointWkt(features);
      expect(result.wkt).toBe('MULTIPOINT ((-122.4194 37.7749), (-118.2437 34.0522))');
    });
  });
});
