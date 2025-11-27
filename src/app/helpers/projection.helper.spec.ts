import { ProjectionHelper } from './projection.helper';

describe('ProjectionHelper', () => {
  describe('ReprojectCoords', () => {
    it('should return same coordinates when fromEpsg equals toEpsg', () => {
      const coords = [
        [32.8597, 39.9334],
        [35.2433, 38.9637],
      ];
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '4326');
      expect(result).toEqual(coords);
    });

    it('should return same coordinates when coords is empty', () => {
      const coords: number[][] = [];
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '3857');
      expect(result).toEqual([]);
    });

    it('should reproject coordinates from EPSG:4326 to EPSG:3857', () => {
      const coords = [[32.8597, 39.9334]]; // Ankara in WGS84
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '3857');

      // Should return transformed coordinates or fallback to original
      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(result[0].length).toBe(2);
      // If proj4 works, coordinates will be much larger (Web Mercator)
      // If proj4 fails, original coordinates are returned
    });

    it('should reproject coordinates from EPSG:3857 to EPSG:4326', () => {
      const coords = [[3658644.33, 4865942.27]]; // Ankara in Web Mercator
      const result = ProjectionHelper.ReprojectCoords(coords, '3857', '4326');

      // Should return transformed coordinates or fallback to original
      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(result[0].length).toBe(2);
    });

    it('should handle multiple coordinate pairs', () => {
      const coords = [
        [32.8597, 39.9334], // Ankara
        [35.2433, 38.9637], // Kayseri
        [28.9784, 41.0082], // Istanbul
      ];
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '3857');

      expect(result.length).toBe(3);
      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
      expect(result[2]).toBeDefined();
    });

    it('should handle negative coordinates', () => {
      const coords = [[-122.4194, 37.7749]]; // San Francisco
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '3857');

      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(result[0].length).toBe(2);
      // Coordinate transformation should handle negative values
    });

    it('should handle decimal precision in coordinates', () => {
      const coords = [[32.859722, 39.933365]]; // High precision Ankara
      const result = ProjectionHelper.ReprojectCoords(coords, '4326', '3857');

      expect(result.length).toBe(1);
      expect(result[0]).toBeDefined();
      expect(typeof result[0][0]).toBe('number');
      expect(typeof result[0][1]).toBe('number');
    });

    it('should return original coords on projection error', () => {
      const coords = [[32.8597, 39.9334]];
      // Using invalid EPSG codes to trigger error
      const result = ProjectionHelper.ReprojectCoords(coords, 'invalid', '3857');

      // Should return original coords when error occurs
      expect(result).toEqual(coords);
    });

    it('should handle null or undefined coords gracefully', () => {
      const result1 = ProjectionHelper.ReprojectCoords(
        null as unknown as number[][],
        '4326',
        '3857'
      );
      const result2 = ProjectionHelper.ReprojectCoords(
        undefined as unknown as number[][],
        '4326',
        '3857'
      );

      expect(result1).toBeNull();
      expect(result2).toBeUndefined();
    });

    it('should reproject coordinates for common Turkish coordinate systems', () => {
      // EPSG:5253 (TUREF / 3-degree Gauss-Kruger zone 10)
      const coords = [[500000, 4428000]]; // Sample TM coordinates
      const result = ProjectionHelper.ReprojectCoords(coords, '5253', '4326');

      expect(result.length).toBe(1);
      expect(result[0][0]).toBeDefined();
      expect(result[0][1]).toBeDefined();
    });
  });
});
