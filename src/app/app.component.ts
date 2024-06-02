import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import * as leaflet from "leaflet";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    let loadingCount: number = Number((Math.random() * 10).toFixed(1));
    setInterval(() => {
      this.loadingText += `\ndata loaded ${loadingCount}%`;
      loadingCount += Number((Math.random() * 10).toFixed(1));
      loadingCount > 100 && (loadingCount = 0);
    }, 1000);

    // keyboard short-cuts
    window.document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "Digit1": {
          this.selectedTool = this.tools[0].name;
          break;
        }
        case "Digit2": {
          this.selectedTool = this.tools[1].name;
          break;
        }
        case "Digit3": {
          this.selectedTool = this.tools[2].name;
          break;
        }
        case "Digit4": {
          this.selectedTool = this.tools[3].name;
          break;
        }
        case "Digit5": {
          this.selectedTool = this.tools[4].name;
          break;
        }
        case "Digit0": {
          this.selectedTool = "none";
          break;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = leaflet
      .map("map")
      .setView([32.6577583119062, 51.669360995292664], 13);
    leaflet
      .tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 19,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "<a>کلیه حقوق برای تیم آنالیز محفوظ است</a> &copy;",
      })
      .addTo(this.map);

    let copyrightContrainer =
      this.mapRef.nativeElement.children[1].children[3].children[0];
    copyrightContrainer.removeChild(copyrightContrainer.children[0]);
    copyrightContrainer.removeChild(copyrightContrainer.children[0]);

    leaflet
      .geoJSON(this.geoJSON, {
        style: {},
      })
      .addTo(this.map);

    let guideLineLayer: leaflet.LayerGroup;
    let tempLayer: leaflet.LayerGroup;
    let tempShape: { lat: number; lng: number }[] = [];

    this.map.on("dblclick", (e) => {
      // draw polygon
      if (this.selectedTool === this.tools[4].name) {
        this.geoJSON.features.push({
          type: "Feature",
          properties: {
            type: this.selectedTool,
            name: `[${this.geoJSON.features.length + 1}] - ${
              this.selectedTool
            }`,
            icon: this.tools.find((tool) => tool.name === this.selectedTool)
              ?.icon,
          },
          geometry: {
            coordinates: [
              [
                ...tempShape.map((ts) => [ts.lng, ts.lat]),
                [tempShape[0].lng, tempShape[0].lat],
              ],
            ],
            type: "Polygon",
          },
        });

        this.renderGeoJSON();
        tempLayer.removeFrom(this.map);
        tempShape = [];
        this.guideLineStart = undefined;
      }

      // draw line
      if (this.selectedTool === this.tools[3].name) {
        this.geoJSON.features.push({
          type: "Feature",
          properties: {
            type: this.selectedTool,
            name: `[${this.geoJSON.features.length + 1}] - ${
              this.selectedTool
            }`,
            icon: this.tools.find((tool) => tool.name === this.selectedTool)
              ?.icon,
          },
          geometry: {
            coordinates: tempShape.map((ts) => [ts.lng, ts.lat]),
            type: "LineString",
          },
        });

        this.renderGeoJSON();
        tempLayer.removeFrom(this.map);
        tempShape = [];
        this.guideLineStart = undefined;
      }

      // draw triaangle
      // in click event section

      // draw circle
      // in click event section

      // draw rectangle
      // in click event section
    });

    this.map.on("click", (e): any => {
      // draw polygon
      if (this.selectedTool == this.tools[4].name) {
        tempShape.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }

      // draw line
      if (this.selectedTool == this.tools[3].name) {
        tempShape.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }

      // draw triangle
      if (this.selectedTool == this.tools[2].name) {
        if (tempShape.length === 3) {
          tempShape = [];
        }

        tempShape.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });

        if (tempShape.length === 3) {
          this.geoJSON.features.push({
            type: "Feature",
            properties: {
              type: this.selectedTool,
              name: `[${this.geoJSON.features.length + 1}] - ${
                this.selectedTool
              }`,
              icon: this.tools.find((tool) => tool.name === this.selectedTool)
                ?.icon,
            },
            geometry: {
              coordinates: [
                [
                  ...tempShape.map((ts) => [ts.lng, ts.lat]),
                  [tempShape[0].lng, tempShape[0].lat],
                ],
              ],
              type: "Polygon",
            },
          });

          this.renderGeoJSON();
          tempLayer.removeFrom(this.map);
          tempShape = [];
          this.guideLineStart = undefined;
          return;
        }
      }

      // draw rectangle
      if (this.selectedTool == this.tools[1].name && this.guideLineStart) {
        this.geoJSON.features.push({
          type: "Feature",
          properties: {
            type: this.selectedTool,
            name: `[${this.geoJSON.features.length + 1}] - ${
              this.selectedTool
            }`,
            icon: this.tools.find((tool) => tool.name === this.selectedTool)
              ?.icon,
          },
          geometry: {
            coordinates: [
              [
                [this.guideLineStart.lng, this.guideLineStart.lat],
                [this.guideLineStart.lng, e.latlng.lat],
                [e.latlng.lng, e.latlng.lat],
                [e.latlng.lng, this.guideLineStart.lat],
                [e.latlng.lng, this.guideLineStart.lat],
              ],
            ],
            type: "Polygon",
          },
        });

        this.renderGeoJSON();
        tempLayer.removeFrom(this.map);
        tempShape = [];
        this.guideLineStart = undefined;
        return;
      }

      // draw circle
      if (this.selectedTool == this.tools[0].name && this.guideLineStart) {
        this.geoJSON.features.push({
          type: "Feature",
          properties: {
            type: this.selectedTool,
            name: `[${this.geoJSON.features.length + 1}] - ${
              this.selectedTool
            }`,
            icon: this.tools.find((tool) => tool.name === this.selectedTool)
              ?.icon,
          },
          geometry: {
            coordinates: [[...tempShape.map((ts) => [ts.lng, ts.lat])]],
            type: "Polygon",
          },
        });

        this.renderGeoJSON();
        tempLayer.removeFrom(this.map);
        tempShape = [];
        this.guideLineStart = undefined;
        return;
      }

      // new guide line
      if (this.selectedTool != "none")
        this.guideLineStart = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
    });

    this.map.on("mousemove", (e) => {
      if (!this.guideLineStart && this.selectedTool != this.tools[2].name)
        return;
      if (guideLineLayer) guideLineLayer.removeFrom(this.map);
      if (tempLayer) tempLayer.removeFrom(this.map);

      // draw polygon
      if (this.selectedTool === this.tools[4].name) {
        tempLayer = leaflet.layerGroup([
          leaflet.polygon([
            ...tempShape,
            { lat: e.latlng.lat, lng: e.latlng.lng },
          ]),
        ]);
        tempLayer.addTo(this.map);
      }

      // draw line
      if (this.selectedTool === this.tools[3].name) {
        tempLayer = leaflet.layerGroup([leaflet.polyline(tempShape)]);
        tempLayer.addTo(this.map);
      }

      // draw triangle
      if (this.selectedTool === this.tools[2].name) {
        if (!this.guideLineStart) return;

        tempLayer = leaflet.layerGroup([
          leaflet.polygon([
            ...tempShape,
            { lat: e.latlng.lat, lng: e.latlng.lng },
          ]),
        ]);
        tempLayer.addTo(this.map);
      }

      // draw rectangle
      if (this.selectedTool === this.tools[1].name) {
        tempLayer = leaflet.layerGroup([
          leaflet.polygon([
            { lat: this.guideLineStart.lat, lng: this.guideLineStart.lng },
            { lat: this.guideLineStart.lat, lng: e.latlng.lng },
            { lat: e.latlng.lat, lng: e.latlng.lng },
            {
              lat: e.latlng.lat,
              lng: this.guideLineStart.lng,
            },
            { lat: e.latlng.lat, lng: this.guideLineStart.lng },
          ]),
        ]);
        tempLayer.addTo(this.map);
      }

      // draw circle
      if (this.selectedTool === this.tools[0].name) {
        tempShape = [];
        let precision = 100;

        for (let counter = 0; counter < precision; counter++) {
          const radius = Math.sqrt(
            Math.pow(e.latlng.lng - this.guideLineStart.lng, 2) +
              Math.pow(e.latlng.lat - this.guideLineStart.lat, 2)
          );

          tempShape.push({
            lng:
              this.guideLineStart.lng +
              Math.cos(((counter / precision) * 360 * Math.PI) / 180) * radius,
            lat:
              this.guideLineStart.lat +
              Math.sin(((counter / precision) * 360 * Math.PI) / 180) * radius,
          });
        }

        tempLayer = leaflet.layerGroup([leaflet.polygon(tempShape)]);
        tempLayer.addTo(this.map);
      }

      // draw guide line
      guideLineLayer = leaflet.layerGroup([
        leaflet.polyline(
          [
            this.guideLineStart,
            {
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            },
          ],
          {
            color: "#3b82f6",
            weight: 3,
            stroke: true,
            dashArray: "8",
          }
        ),
      ]);
      guideLineLayer.addTo(this.map);
    });

    this.map.invalidateSize();
  }

  rename(event: any, oldName: any) {
    this.geoJSON.features = this.geoJSON.features.map((gj: any) => {
      if (gj.properties.name === oldName)
        gj.properties.name = event.target.value;
      return gj;
    });
  }

  deleteShape(name: string) {
    this.geoJSON.features = this.geoJSON.features.filter(
      (feature: any) => feature.properties.name !== name
    );
    this.renderGeoJSON();
  }

  // clear last layer
  // re-render new stuff
  renderGeoJSON() {
    if (this.geoJSONLayer) this.geoJSONLayer.removeFrom(this.map);
    this.geoJSONLayer = leaflet
      .layerGroup([
        leaflet.geoJSON(this.geoJSON, {
          style: {
            color: "red",
            dashArray: "10",
          },
        }),
      ])
      .addTo(this.map);
  }

  // export geoJSON data
  export() {
    this.exporterRef.nativeElement.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.geoJSON, null, "\t"))
    );
    this.exporterRef.nativeElement.setAttribute("download", "export.json");

    this.exporterRef.nativeElement.click();
  }

  // import geoJSON data
  import() {
    this.importerRef.nativeElement.click();

    this.importerRef.nativeElement.onchange = (event: any) => {
      let file: any = event.target.files[0];
      let fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = (e: any) => {
        try {
          this.geoJSON = JSON.parse(e.target?.result);
          this.renderGeoJSON();
        } catch (error) {
          window.alert("Invalid input.");
        }
      };
    };
  }

  // loading
  title = "Project Atlas";
  loadingText: string = "Initializing required system components :";

  // main
  @ViewChild("importer") importerRef!: ElementRef<HTMLInputElement>;
  @ViewChild("exporter") exporterRef!: ElementRef<HTMLAnchorElement>;
  @ViewChild("map") mapRef!: ElementRef<HTMLDivElement>;
  public guideLineStart: any;
  public geoJSONLayer!: leaflet.LayerGroup;
  public geoJSON: any = {
    type: "FeatureCollection",
    features: [],
  };
  map!: leaflet.Map;
  public selectedTool: string = "none";
  public readonly tools: {
    name: string;
    icon: string;
  }[] = [
    {
      name: "circle",
      icon: "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
    },
    {
      name: "rectangle",
      icon: "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z",
    },
    {
      name: "triangle",
      icon: "m80-160 400-640 400 640H80Zm144-80h512L480-650 224-240Zm256-205Z",
    },
    {
      name: "line",
      icon: "M212-212q-11-11-11-28t11-28l480-480q11-12 27.5-12t28.5 12q11 11 11 28t-11 28L268-212q-11 11-28 11t-28-11Z",
    },
    {
      name: "polygon",
      icon: "M298-200h364l123-369-305-213-305 213 123 369Zm-58 80L80-600l400-280 400 280-160 480H240Zm240-371Z",
    },
  ];
}
