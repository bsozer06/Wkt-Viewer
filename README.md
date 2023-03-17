# Wkt-Viewer

In this project, Well Known Text (WKT) that be entered to form  is drawn on map. ArcGIS SDK technology is utilized for GIS processes.

## Screenshot
![Wkt-Viewer](https://user-images.githubusercontent.com/56292618/226048917-494e7992-81c7-463b-8901-b4d304d12d48.PNG)

## Technologies
* Angular Framework 13.3.2
* Arcgis SDK For Javascript 4.26
* Rxjs 7.8.0
* Material UI 15.2.2

## Project Structure
The communication amongst component is enabled by utilizing EventService. Input and Output decorators have not prefered.

### Components
* MapComponent
* WktComponent
### Helpers
* ProjectionHelper
* WktHelper
### Services
* EventService
* MapService
* LayerService
### Types
* WktForm

### TODOs
- State managements can be managed with Ngrx instead of the service structure.
- Import other file types such as shapefile, geojson and so on.
- Projections helper class can be developed by using Proj4 library.
- LayerService should be updated.
- Unnecessary comments should be removed.
