
import Geometry from "@arcgis/core/geometry/Geometry.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as projection from "@arcgis/core/geometry/projection";
import Point from "@arcgis/core/geometry/Point";

export class ProjectionHelper {
    
    // todo: improve
    public static Transform(input: Geometry | Geometry[], outputSpatialRef: SpatialReference, manyGeoms: false ) {
        if (!manyGeoms) {
            return projection.project(input as Geometry, outputSpatialRef);
        } 
        
        return (input as Geometry[]).map(geom => geom);
    }

    public static ConvertTest() {
        var webMercatorPoint = new Point();
        webMercatorPoint.x = -13171975;
        webMercatorPoint.y = 4041198;
        webMercatorPoint.spatialReference = new SpatialReference({ wkid: 102100 });
        // var geographicTransformation = projection.getTransformation(this.view.spatialReference, new SpatialReference({ wkid: 4326}))
        var wgs84Point = projection.project(webMercatorPoint,  new SpatialReference({ wkid: 4326}) );

        console.log("Web Mercator Point:", webMercatorPoint.spatialReference.wkid);
        console.log("WGS84 Point:", (wgs84Point as Geometry).spatialReference?.wkid);
    }

}