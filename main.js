import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import OSM from 'ol/source/OSM';
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import * as olProj from 'ol/proj';
import Source from 'ol/source/Source';
import GeoTIFF from 'ol/source/GeoTIFF';
import Overlay from 'ol/Overlay';

  //toggle seafloor view 
  document.getElementById("menu-ui").onclick = function() { 
    rendered.setVisible(!rendered.getVisible());
  }; 

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
 const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const bathyStyle = {
  "version": 8,
  "sources": {
      "hs_tory": {
          "type": "raster",
          "tiles": ["https://tile-service-raster.s3.us-east-1.amazonaws.com/tiles/base-bathy/{z}/{x}/{y}.png"],
          "bounds": [-178.826516,-52.620881,179.067794,-29.231342],
          "scheme": "xyz",
          "tileSize": 256,
          "attribution": "Mine!",
          "maxzoom": 18
      },
      "hs_nz": {
          "type": "raster",
          "tiles": ["https://tile-service-raster.s3.us-east-1.amazonaws.com/tiles/hs-nz/{z}/{x}/{y}.png"],
          "bounds": [-178.826516,-52.620881,179.067794,-29.231342],
          "scheme": "tms",
          "tileSize": 256,
          "attribution": "Mine!",
          "maxzoom": 18
      },
      "hs_raster": {
          "type": "raster",
          "tiles": ["https://tile-service-raster.s3.us-east-1.amazonaws.com/tiles/marlborough-tiles/{z}/{x}/{y}.png"],
          "bounds": [-178.826516,-52.620881,179.067794,-29.231342],
          "scheme": "xyz",
          "tileSize": 256,
          "attribution": "Mine!",
          "maxzoom": 18
      }
  },
  "layers":[         
     {
          "id": "hs_tory",
          "source": "hs_tory",
          "type": "raster",
          "layout": { "visibility": "visible" },
          "paint": {
              "raster-resampling": "linear",
              "raster-opacity": 1.0,
          }
     },
     {
          "id": "hs_nz",
          "source": "hs_nz",
          "type": "raster",
          "layout": { "visibility": "visible" },
          "paint": {
              "raster-opacity": 1,
              "raster-resampling": "linear",
              "raster-brightness-max": 1.0,
              "raster-brightness-min": 0.5,
              "raster-contrast": 0.25
          }
      },
      {
          "id": "hs_raster",
          "source": "hs_raster",
          "type": "raster",
          "layout": { "visibility": "visible" },
          "paint": {
              "raster-opacity": 1,
              "raster-resampling": "linear",
              "raster-brightness-max": 1.0,
              "raster-brightness-min": 0.5,
              "raster-contrast": 0.25
              }
      }
  ]
}

const url = 'https://tile-service-raster.s3.us-east-1.amazonaws.com/cogs/seafloor/HS51_Seafloor_Classification_webmer_cog.tif'

const source = new GeoTIFF({
  normalize: false,
  sources: [
    {
      url: url,
      min: 1,
      max: 4,
      nodata: 127,
    }
  ],
});

// cog file load
const rendered = new TileLayer({
  visible: false,
  crossOrigin: 'anonymous',
  opacity: 0.35,
  source: source,
  style: {
    color: [
      'interpolate',
      ['linear'],
      ['*', ['band', 1], 1],
      0, [0,0,0,0],
      1, [191, 33, 47, 1],
      2, [249, 167, 62, 1],
      3, [0, 111, 60, 1],
      4, [38,75,150, 1]
     ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15
  }
})

const base =  new MapLibreLayer({  
  crossOrigin: 'anonymous',
  maplibreOptions: {
    style: bathyStyle,
  },
});

const vectorTile = new MapLibreLayer({  
  opacity: 0.85,
  crossOrigin: 'anonymous',
  maplibreOptions: {
    style: './style/style.json'
  }
});

const map = new Map ({
  layers: [base, vectorTile, rendered],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([174.0,-41.29]),
    zoom: 10
  })
});

map.on('singleclick', function(evt) {
  const coordinate = evt.coordinate;
  const data = rendered.getData(evt.pixel);
  console.log(data[0])  
  content.innerHTML = '<p>Seafloor classification value here is:</p><code>' + data[0] + '</code>';
  overlay.setPosition(coordinate);    
})