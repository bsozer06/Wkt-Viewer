
# Wkt-Viewer

[![CI/CD Pipeline](https://github.com/bsozer06/Wkt-Viewer/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/bsozer06/Wkt-Viewer/actions/workflows/ci-cd.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c01fdcd2-8592-4fb2-8c57-28453989bf2f/deploy-status)](https://app.netlify.com/sites/leafy-travesseiro-7977cd/deploys)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://leafy-travesseiro-7977cd.netlify.app)

Wkt-Viewer is a web application for visualizing Well-Known Text (WKT) geometries on an interactive map. Users can input WKT, select coordinate reference systems, and instantly see the geometry rendered using ArcGIS SDK for JavaScript. The app supports import/export of WKT and GeoJSON, and provides a modern UI for quick actions and file management.

## Features
- **Visualize WKT**: Enter WKT (POINT, LINESTRING, POLYGON, MULTIPOINT) and see it drawn on the map.
- **EPSG Selection**: Choose the coordinate reference system (e.g., EPSG:4326, EPSG:3857).
- **Import/Export**: Drag & drop or browse files (.wkt, .geojson, .json) to import geometries. Export current geometry as WKT or GeoJSON.
- **Quick Actions**: Paste sample geometries, copy WKT to clipboard, clear input, and use map’s spatial reference.
- **Edit Geometry**: Use ArcGIS Sketch tool to edit imported or drawn graphics directly on the map.

## Screenshot
![Wkt-Viewer Screenshot](src/assets/wkt-viewer-screenshot.png)

## Technologies Used
- **Angular**: 13.3.2
- **ArcGIS SDK for JavaScript**: 4.26
- **RxJS**: 7.8.0
- **Angular Material**: 15.2.2
- **Proj4**: For coordinate reprojection

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation
```sh
git clone https://github.com/bsozer06/Wkt-Viewer.git
cd Wkt-Viewer
npm install
```

### Running the App
```sh
npm start
```
Open [http://localhost:4200](http://localhost:4200) in your browser.

### Testing
```sh
npm test
```

The project includes comprehensive unit tests for critical components:

#### Test Summary
- **Total: 114 tests** - All passing ✅
- **WktHelper**: 42 tests
- **ProjectionHelper**: 11 tests
- **MapGraphicsHelper**: 32 tests
- **EventService**: 18 tests
- **LayerService**: 30 tests
- **AppComponent**: 1 test

#### WktHelper Tests (42 tests)
All WKT parsing and conversion methods:
- `GetGeomType`: Geometry type detection (POINT, LINESTRING, POLYGON, MULTIPOINT)
- `WktToCoordArray`: WKT to coordinate array conversion
- `GeometryToWkt`: ArcGIS geometry to WKT conversion
- `WktToGeoJSON`: WKT to GeoJSON Feature conversion with CRS support
- `GeoJSONToWkt`: GeoJSON to WKT conversion with EPSG extraction
- `FeaturesToMultiPointWkt`: Multiple Point features to MULTIPOINT WKT
- Edge cases: null/undefined values, invalid formats, empty arrays
- Coordinate formats: decimal, negative, various whitespace handling

#### ProjectionHelper Tests (11 tests)
Coordinate reprojection functionality:
- `ReprojectCoords`: EPSG transformation with Proj4
- Same EPSG handling (no transformation)
- Empty coordinates handling
- Multiple coordinate pairs
- Negative coordinates
- Error handling and fallback

#### MapGraphicsHelper Tests (32 tests)
Graphics layer management:
- `addPointToGraphicLayer`: Point graphic creation and styling
- `addLinestringToGraphicLayer`: Polyline graphic creation
- `addPolygonToGraphicLayer`: Polygon graphic creation with fill/outline
- `addMultiPointToGraphicLayer`: Multiple point graphics
- Coordinate validation and error handling
- Different spatial references (EPSG:4326, EPSG:3857)

#### EventService Tests (18 tests)
RxJS-based component communication:
- Graphic change events emission and subscription
- WktForm change events
- Multiple subscribers support
- Observable functionality

#### LayerService Tests (30 tests)
State management for graphics and WKT:
- GraphicsLayer instance management
- Graphic instance management
- WKT string storage and retrieval
- EPSG code management
- Combined state management
- Service singleton behavior

Run specific test files:
```sh
npm test -- --include='**/wkt.helper.spec.ts'
npm test -- --include='**/projection.helper.spec.ts'
npm test -- --include='**/map-graphics.helper.spec.ts'
npm test -- --include='**/event.service.spec.ts'
npm test -- --include='**/layer.service.spec.ts'
```

## Project Structure

```
src/
	app/
		components/
			map/         # Map display and editing
			wkt/         # WKT input and import/export
		helpers/       # Projection and WKT utilities
		services/      # Event, map, and layer management
		types/         # Type definitions
	assets/
	environments/
```

### Communication
Component communication is handled via `EventService` (RxJS Subjects). Angular Input/Output decorators are not used.

### Main Components
- **MapComponent**: Renders and edits map graphics
- **WktComponent**: Handles WKT input, import/export, and UI actions

### Helpers
- **ProjectionHelper**: Coordinate reprojection (ArcGIS & Proj4)
  - Tested with 11 unit tests
  - EPSG transformation using Proj4
  - Handles coordinate reprojection between different CRS
- **WktHelper**: WKT parsing and conversion
  - Pure static utility class with no external dependencies
  - Fully tested with 42 unit tests
  - Handles POINT, LINESTRING, POLYGON, MULTIPOINT geometries
  - Bidirectional conversion between WKT, GeoJSON, and ArcGIS geometries
  - EPSG/CRS support for coordinate reference systems
- **MapGraphicsHelper**: Graphics layer utilities
  - Tested with 32 unit tests
  - Point, LineString, Polygon, and MultiPoint graphic creation
  - Configurable styling and symbology

### Services
- **EventService**: Component communication
  - Tested with 18 unit tests
  - RxJS-based event system for Graphic and WktForm changes
  - Multiple subscriber support
- **MapService**: Map initialization and management
  - ArcGIS map instance creation
  - Coordinate conversion and fullscreen widgets
- **LayerService**: Graphics layer management
  - Tested with 30 unit tests
  - State management for graphics, WKT, and EPSG
  - Singleton service pattern

### Types
- **WktForm**: WKT form model

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Testing Strategy

The project prioritizes testing for business logic and utility functions:

1. **WktHelper** ✅ - **Completed** (42 tests)
   - Pure logic with no external dependencies
   - Critical functionality for WKT/GeoJSON conversion
   - High risk for parsing errors
   
2. **ProjectionHelper** ✅ - **Completed** (11 tests)
   - Coordinate transformation logic
   - Multiple EPSG support validation
   - Proj4 integration testing

3. **MapGraphicsHelper** ✅ - **Completed** (32 tests)
   - Graphics layer management
   - Symbol and geometry creation
   - ArcGIS integration testing

4. **Services** ✅ - **Completed** (48 tests)
   - **EventService** (18 tests): RxJS Subject/Observable patterns
   - **LayerService** (30 tests): State management and singleton behavior
   - **MapService**: Future consideration (requires ArcGIS mocking)

## Roadmap / TODOs
- Switch to NgRx for state management
- Support more file types (e.g., shapefile, GeoJSON)
- Add more geometry types and features
- Remove unnecessary comments and refactor code
- Add unit tests for MapService (requires ArcGIS SDK mocking)
- Add unit tests for UI components (MapComponent, WktComponent)
- Improve test coverage for edge cases and error scenarios

## License
MIT
