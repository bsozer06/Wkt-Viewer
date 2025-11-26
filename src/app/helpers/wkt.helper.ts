export class WktHelper {
  public static WktToCoordArray(wkt: string): any[] {
    if (wkt) {
      const geomType = this.GetGeomType(wkt);
      if (geomType === 'MULTIPOINT') {
        // Handle MULTIPOINT: extract all point coordinates
        const match = wkt.match(/MULTIPOINT\s*\((.+)\)/i);
        if (match) {
          const pointsStr = match[1];
          // Handle both formats: MULTIPOINT(1 2, 3 4) or MULTIPOINT((1 2), (3 4))
          const points = pointsStr
            .split(/\),?\s*\(/)
            .map((p) => p.replace(/[()]/g, '').trim())
            .filter((p) => p.length > 0)
            .map((p) => {
              const [x, y] = p.trim().split(/\s+/);
              return [parseFloat(x), parseFloat(y)];
            });
          return points;
        }
      }
      const coords = this._GetCoordsArray(wkt);
      console.log(geomType, coords);
      const coordsStringArr = this._CoordsToStringArray(coords);
      return this._CoordsToNumberArray(coordsStringArr);
    }
    return [];
  }

  public static GeometryToWkt(geometry: any): string {
    if (geometry?.type == 'point') {
      return `POINT (${geometry.x} ${geometry.y})`;
    } else if (geometry?.type == 'polyline' && geometry?.paths) {
      const arr: string[] = [];
      geometry!.paths[0].forEach((path: any) => {
        arr.push(`${path}`.replace(',', ' '));
      });
      return `LINESTRING (${arr.toString()})`;
    } else if (geometry?.type == 'polygon' && geometry?.rings) {
      const arr: string[] = [];
      geometry!.rings[0].forEach((ring: any) => {
        arr.push(`${ring}`.replace(',', ' '));
      });
      return `POLYGON ((${arr.toString()}))`;
    }
    return '';
  }

  private static _GetCoordsArray(wkt: string): string {
    const firstIndex = wkt.indexOf('(');
    const secondIndex = wkt.indexOf(')');
    let coords = wkt
      .substring(firstIndex + 1, secondIndex)
      .trim()
      .toUpperCase();
    if (coords.includes('(')) {
      coords = coords.replace('(', '');
    }
    return coords;
  }

  public static GetGeomType(wkt: string): string {
    return wkt.substring(0, wkt.indexOf('(')).trim().toUpperCase();
  }

  private static _CoordsToStringArray(coords: string): string[] {
    return coords.split(',');
  }

  private static _CoordsToNumberArray(coords: string[]): any {
    return coords.map((x) => x.trim().split(' ')).map((x: any[]) => [x[0] * 1, x[1] * 1]);
  }

  // GeoJSON conversion helpers
  public static WktToGeoJSON(wkt: string, epsg?: string): any {
    const geomType = this.GetGeomType(wkt);
    const coords = this.WktToCoordArray(wkt);

    let geoJsonType = '';
    let geoJsonCoords: any = coords;

    switch (geomType) {
      case 'POINT':
        geoJsonType = 'Point';
        geoJsonCoords = coords[0];
        break;
      case 'LINESTRING':
        geoJsonType = 'LineString';
        break;
      case 'POLYGON':
        geoJsonType = 'Polygon';
        geoJsonCoords = [coords];
        break;
      default:
        throw new Error(`Unsupported geometry type: ${geomType}`);
    }

    const feature: any = {
      type: 'Feature',
      geometry: {
        type: geoJsonType,
        coordinates: geoJsonCoords,
      },
      properties: {},
    };

    if (epsg) {
      feature.crs = {
        type: 'name',
        properties: {
          name: `EPSG:${epsg}`,
        },
      };
    }

    return feature;
  }

  public static GeoJSONToWkt(geoJson: any): { wkt: string; epsg?: string } {
    const geometry = geoJson.geometry || geoJson;
    const type = geometry.type?.toUpperCase();
    const coords = geometry.coordinates;

    let wkt = '';
    let epsg: string | undefined;

    // Extract EPSG if available
    if (geoJson.crs?.properties?.name) {
      const match = geoJson.crs.properties.name.match(/EPSG:(\d+)/);
      if (match) {
        epsg = match[1];
      }
    }

    switch (type) {
      case 'POINT':
        wkt = `POINT (${coords[0]} ${coords[1]})`;
        break;
      case 'LINESTRING':
        wkt = `LINESTRING (${coords.map((c: number[]) => `${c[0]} ${c[1]}`).join(', ')})`;
        break;
      case 'POLYGON':
        const ring = coords[0].map((c: number[]) => `${c[0]} ${c[1]}`).join(', ');
        wkt = `POLYGON ((${ring}))`;
        break;
      default:
        throw new Error(`Unsupported GeoJSON type: ${type}`);
    }

    return { wkt, epsg };
  }

  // Convert multiple Point features to MULTIPOINT WKT
  public static FeaturesToMultiPointWkt(features: any[]): { wkt: string; epsg?: string } {
    const points: string[] = [];
    let epsg: string | undefined;

    features.forEach((feature) => {
      const geometry = feature.geometry || feature;
      if (geometry.type?.toUpperCase() === 'POINT') {
        const coords = geometry.coordinates;
        points.push(`(${coords[0]} ${coords[1]})`);

        // Extract EPSG from first feature
        if (!epsg && feature.crs?.properties?.name) {
          const match = feature.crs.properties.name.match(/EPSG:(\d+)/);
          if (match) {
            epsg = match[1];
          }
        }
      }
    });

    const wkt = `MULTIPOINT (${points.join(', ')})`;
    return { wkt, epsg };
  }
}
