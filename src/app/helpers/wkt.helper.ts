export class WktHelper {
    public static WktToCoordArray(wkt: string): any[] {
        if(wkt) {
            const geomType = this.GetGeomType(wkt);
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
            let arr: string[] = [];
            geometry!.paths[0].forEach((path: any) => {
                arr.push(`${path}`.replace(',', ' '));
            });
            return `LINESTRING (${arr.toString()})`;
        } else if (geometry?.type == 'polygon' && geometry?.rings) {
            let arr: string[] = [];
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
        let coords = wkt.substring(firstIndex + 1 , secondIndex).trim().toUpperCase();
        if(coords.includes('(')) {
            coords = coords.replace('(', '');
        }
        return coords;
    };

    public static GetGeomType(wkt: string): string {
        return wkt.substring(0, wkt.indexOf('(')).trim().toUpperCase();
    };

    private static _CoordsToStringArray(coords: string): string[] {
        return coords.split(',');
    }

    private static _CoordsToNumberArray(coords: string[]): any {
        return coords.map(x => x.trim().split(' ')).map((x: any[]) => [x[0]*1, x[1]*1]);
    }
}