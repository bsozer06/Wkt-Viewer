import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

export class MapGraphicsHelper {
  static addPolygonToGraphicLayer(
    coordsArr: number[][],
    epsg: number,
    graphicLayer: GraphicsLayer
  ): Graphic {
    const polygon = {
      type: 'polygon',
      rings: coordsArr,
      spatialReference: new SpatialReference({ wkid: epsg }),
    };
    const symbol = {
      type: 'simple-fill',
      color: [186, 46, 34, 0.5],
      style: 'solid',
      outline: {
        color: 'red',
        width: 3,
      },
    };
    const polygonGraphic = new Graphic({
      geometry: polygon as __esri.GeometryProperties,
      visible: true,
      symbol: symbol,
    });
    polygonGraphic.geometry.spatialReference = new SpatialReference({ wkid: epsg });

    graphicLayer.add(polygonGraphic);
    return polygonGraphic;
  }

  static addLinestringToGraphicLayer(
    coordsArr: number[][],
    epsg: number,
    graphicLayer: GraphicsLayer
  ): Graphic {
    const linestring = {
      type: 'polyline',
      paths: coordsArr,
      spatialReference: new SpatialReference({ wkid: epsg }),
    };
    const lineSymbol = {
      type: 'simple-line',
      color: [226, 119, 40],
      width: 4,
    };
    const polylineGraphic = new Graphic({
      geometry: linestring as __esri.GeometryProperties,
      visible: true,
      symbol: lineSymbol,
    });
    polylineGraphic.geometry.spatialReference = new SpatialReference({ wkid: epsg });

    graphicLayer.add(polylineGraphic);
    return polylineGraphic;
  }

  static addPointToGraphicLayer(
    coordsArr: number[][],
    epsg: number,
    graphicLayer: GraphicsLayer
  ): Graphic | null {
    const first = coordsArr?.[0];
    if (!first || first.length < 2) {
      return null;
    }
    const point = {
      type: 'point',
      x: first[0],
      y: first[1],
      spatialReference: new SpatialReference({ wkid: epsg }),
    } as __esri.PointProperties;

    const markerSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: [0, 122, 255, 1],
      size: 8,
      outline: { color: [255, 255, 255, 1], width: 2 },
    } as __esri.SimpleMarkerSymbolProperties;

    const pointGraphic = new Graphic({
      geometry: point,
      visible: true,
      symbol: markerSymbol,
    });

    graphicLayer.add(pointGraphic);
    return pointGraphic;
  }

  static addMultiPointToGraphicLayer(
    coordsArr: number[][],
    epsg: number,
    graphicLayer: GraphicsLayer
  ): void {
    if (!coordsArr || coordsArr.length === 0) {
      return;
    }

    const markerSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: [0, 122, 255, 1],
      size: 8,
      outline: { color: [255, 255, 255, 1], width: 2 },
    } as __esri.SimpleMarkerSymbolProperties;

    coordsArr.forEach((coord: number[]) => {
      if (coord && coord.length >= 2) {
        const point = {
          type: 'point',
          x: coord[0],
          y: coord[1],
          spatialReference: new SpatialReference({ wkid: epsg }),
        } as __esri.PointProperties;

        const pointGraphic = new Graphic({
          geometry: point,
          visible: true,
          symbol: markerSymbol,
        });

        graphicLayer.add(pointGraphic);
      }
    });
  }
}
