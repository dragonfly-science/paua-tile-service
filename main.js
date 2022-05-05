import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import OSM from 'ol/source/OSM';
import MapLibreLayer from '@geoblocks/ol-maplibre-layer';
import * as olProj from 'ol/proj';
import GeoTIFF from 'ol/source/GeoTIFF';
import Overlay from 'ol/Overlay';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Create an overlay to anchor the popup to the map
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

// URL to COG tile
const url = 'https://tile-service-raster.s3.us-east-1.amazonaws.com/cogs/seafloor/HS51_Seafloor_Classification_webmer_cog.tif'

// Grab COG tile, set min, max, nodata
const cogSource = new GeoTIFF({
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

const cogVis = [
  {
    name: "All Values",
    style: {
      color: [
        'interpolate',
        ['linear'],
        ['band', 1],
        0, [0,0,0,0],
        1, [191, 33, 47, 1],
        2, [249, 167, 62, 1],
        3, [0, 111, 60, 1],
        4, [38,75,150, 1]
       ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15,
    }
  },
  {
    name: "Mud Only",
    style: {
      color: [
        'interpolate',
        ['linear'],
        ['band', 1],
        0, [0,0,0,0],
        1, [191, 33, 47, 1],
        2, [249, 167, 62, 0],
        3, [0, 111, 60, 0],
        4, [38,75,150, 0]
       ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15,
    }    
  },
  {
    name: "Fine Sand Only",
    style: {
      color: [
        'interpolate',
        ['linear'],
        ['band', 1],
        0, [0,0,0,0],
        1, [191, 33, 47, 0],
        2, [249, 167, 62, 1],
        3, [0, 111, 60, 0],
        4, [38,75,150, 0]
       ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15,
    }    
  },
  {
    name: "Medium Sand Only",
    style: {
      color: [
        'interpolate',
        ['linear'],
        ['band', 1],
        0, [0,0,0,0],
        1, [191, 33, 47, 0],
        2, [249, 167, 62, 0],
        3, [0, 111, 60, 1],
        4, [38,75,150, 0]
       ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15,
    }    
  },
  {
    name: "Gravel Only",
    style: {
      color: [
        'interpolate',
        ['linear'],
        ['band', 1],
        0, [0,0,0,0],
        1, [191, 33, 47, 0],
        2, [249, 167, 62, 0],
        3, [0, 111, 60, 0],
        4, [38,75,150, 1]
       ],
     saturation: 1,
     exposure: 0.25,
     contrast: 0.15,
    }
    
  }
];

const defaultColor = {
  color: [
    'interpolate',
    ['linear'],
    ['band', 1],
    0, [0,0,0,0],
    1, [191, 33, 47, 1],
    2, [249, 167, 62, 1],
    3, [0, 111, 60, 1],
    4, [38,75,150, 1]
   ],
   saturation: 1,
   exposure: 0.25,
   contrast: 0.15,
};

// cog file load and colour values
const cog = new TileLayer({
  visible: false,
  crossOrigin: 'anonymous',
  opacity: 0.35,
  source: cogSource,
  style: defaultColor
})

// Set base raster tiles
const baseRasterTile =  new MapLibreLayer({
  crossOrigin: 'anonymous',
  maplibreOptions: {
    style: './style/rasterTiles.json',
  },
});

// Set vector tiles
const vectorTile = new MapLibreLayer({
  opacity: 0.75,
  crossOrigin: 'anonymous',
  maplibreOptions: {
    style: './style/style.json'
  }
});

// draw map
const map = new Map ({
  layers: [baseRasterTile, vectorTile, cog],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([174.2,-41.18]),
    zoom: 11,
    maxZoom: 15,
    minZoom: 9
  })
});


document.getElementById("seafloor").onclick = function() {
  cog.setVisible(!cog.getVisible());
  const resetDiv = document.getElementById("seafloor");
  const colorSelect = document.getElementById('selectDiv');
  if (colorSelect.style.display === 'block') {
    colorSelect.innerHTML = "";
    colorSelect.style.display = "none";
    } else {
    const selectList = document.createElement("select");
    selectList.id = "select";
    colorSelect.appendChild(selectList);
    cogVis.forEach((visualization) => {
      const option = document.createElement('option');
      option.textContent = visualization.name;
      selectList.appendChild(option);
      })
    colorSelect.style.display = 'block';

    const styles = document.querySelector('select');
    const styleSelector = document.getElementById('selectDiv');

    function update() {
      const getVal = styles.selectedIndex;
      const optionName = (styles.options[getVal].text)
      console.log(optionName)
      const nameEl = cogVis.find(nameEl => nameEl.name === optionName);
      const newStyle = nameEl.style;  
      console.log(newStyle);
      cog.setStyle(newStyle);
      //   console.log(optionName)
    }

    styleSelector.addEventListener('change', update);
  }
  function resetCog() {
    cog.setStyle(defaultColor)
  }
  resetDiv.addEventListener('click', resetCog)
};

// Set onclick to return values from COG
map.on('singleclick', function(evt) {
  const coordinate = evt.coordinate;
  const data = cog.getData(evt.pixel);
  console.log(data[0])
  if (data[0]==1) {
    var codeText = "Low reflectivity (mud)"
  } else if (data[0]==2) {
    var codeText = "Low - medium reflectivity (fine sand)"
  } else if (data[0]==3) {
    var codeText = "Medium - high reflectivity (medium sand)"
  } else if (data[0]==4) {
    var codeText = "High reflectivity (coarse sand, gravel)"
  }
  content.innerHTML = '<p>Seafloor classification value:</p><p><code>' + data[0] + '</code></p><p>' + codeText + '</p>';
  overlay.setPosition(coordinate);
})

