import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
// arcgis
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mapViewNode') private mapViewEl!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    const map = new Map({
      basemap: 'topo-vector',
      ground: 'world-elevation',
    });
    new SceneView({
      container: this.mapViewEl.nativeElement,
      map,
      scale: 50000000,
      center: [-101.17, 21.78],
    });
  }
}
