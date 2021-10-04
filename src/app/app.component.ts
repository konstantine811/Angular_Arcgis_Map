import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';

// arcgis
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Sketch from '@arcgis/core/widgets/Sketch';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
// material
import { MatDialog } from '@angular/material/dialog';
// components dialog
import { CreateFieldDialogComponent } from './components/create-field-dialog/create-field-dialog.component';
import { IFeildFormData, IFieldArcgisAttr } from './models/data/field-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mapViewNode') private mapViewEl!: ElementRef;

  featureLayer!: FeatureLayer;
  graphicsLayer!: GraphicsLayer;
  sceneView!: SceneView;
  sketch!: Sketch;
  fieldData!: IFeildFormData;

  constructor(public dialog: MatDialog) {}

  ngAfterViewInit(): void {
    const map = new Map({
      basemap: 'hybrid',
      ground: 'world-elevation',
    });
    this.sceneView = new SceneView({
      container: this.mapViewEl.nativeElement,
      map,
      scale: 50000000,
      center: [-101.17, 21.78],
      popup: {
        defaultPopupTemplateEnabled: true,
      },
    });

    this.featureLayer = new FeatureLayer({
      url: 'https://services6.arcgis.com/AdMQ9oCp30CfMWVW/arcgis/rest/services/fields/FeatureServer/0',
      popupEnabled: true,
    });

    this.graphicsLayer = new GraphicsLayer({
      elevationInfo: { mode: 'on-the-ground' },
      title: 'Sketch GraphicsLayer',
    });
    this.sceneView.when(() => {
      this.sketch = new Sketch({
        layer: this.graphicsLayer,
        view: this.sceneView,
        creationMode: 'update',
        defaultCreateOptions: {
          hasZ: false,
        },
        defaultUpdateOptions: {
          enableZ: false,
        },
      });

      this.sceneView.ui.add(this.sketch, 'top-right');

      this.sketch.on('create', (e) => {
        if (e.state === 'complete') {
          console.log(e.graphic);
        }
      });
      this.sketch.on('update', (e) => {
        if (e.state === 'complete') {
          this.openDialog(e.graphics[0]);
        }
      });
    });

    map.add(this.featureLayer);
    map.add(this.graphicsLayer);
    this.featureLayer.queryFeatures().then((res) => {
      this.sceneView.goTo(res.features[0].geometry.extent);
    });

    this.featureLayer.when(() => {
      this.featureLayer.sourceJSON.drawingInfo.renderer =
        new UniqueValueRenderer({
          field: 'CropName',
          defaultSymbol: new SimpleFillSymbol({
            color: [0, 0, 0, 0.3],
          }), // autocasts as new SimpleFillSymbol()
          uniqueValueInfos: [
            {
              // All features with value of "North" will be blue
              value: 'Зерно',
              symbol: new SimpleFillSymbol({
                color: [255, 255, 255, 0.5],
              }),
            },
          ],
        });
    });
    this.addCustromPopupAction();
  }

  addCustromPopupAction() {
    // Defines an action to zoom out from the selected feature
    let editAaction = new ActionButton({
      // This text is displayed as a tooltip
      title: 'Редактировать полигон',
      // The ID by which to reference the action in the event handler
      id: 'edit-polygon',
      // Sets the icon font used to style the action button
      className: 'esri-icon-edit',
    });
    // Adds the custom action to the popup.
    this.sceneView.popup.actions.push(editAaction);
    this.sceneView.popup.on('trigger-action', async (e) => {
      console.log(e.action);
      const { OBJECTID } = this.sceneView.popup.selectedFeature
        .attributes as IFieldArcgisAttr;
      const query = this.featureLayer.createQuery();
      query.returnGeometry = true;
      query.where = `OBJECTID = ${OBJECTID}`;
      const { features } = await this.featureLayer.queryFeatures(query);
      console.log(features);
      const feature = features[0];
      this.graphicsLayer.add(feature);
      this.sketch.update(feature);
      this.sceneView.popup.close();
      this.featureLayer.applyEdits({
        deleteFeatures: [this.sceneView.popup.selectedFeature],
      });
    });
  }

  openDialog(graphicData: Graphic) {
    const dialogRef = this.dialog.open(CreateFieldDialogComponent, {
      width: '340px',
      disableClose: true,
      data: graphicData.attributes,
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res: IFeildFormData) => {
        console.log(res);
        if (res && res.fieldName && res.cropName && res.harvestYear) {
          graphicData.attributes = res;
          this.featureLayer
            .applyEdits({
              addFeatures: [graphicData],
            })
            .then((results) => {
              console.log(results);
            });
          this.graphicsLayer.remove(graphicData);
        }
      });
  }
}
