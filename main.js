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
};

// cog file load and colour values
const cog = new TileLayer({
  visible: false,
  crossOrigin: 'anonymous',
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

  // Build Style Selector and opacity control
  // Remove if exists
  if (colorSelect.style.display === 'block') {
    colorSelect.innerHTML = "";
    colorSelect.style.display = "none";
    const opaclabel = document.getElementById("cogOpacity");
    opaclabel.innerHTML = "";
    opaclabel.style.display = "none";
    } else {
    const selectList = document.createElement("select");
    selectList.id = "select";
    selectList.class = "select";
    colorSelect.appendChild(selectList);
    colorSelect.style.paddingBottom = '10px';
    colorSelect.style.paddingLeft = '10px';

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

    // Opacity Controller
    const opaclabel = document.getElementById("cogOpacity");
    opaclabel.style.display = "block";
    opaclabel.innerHTML = "COG Opacity: <span id='output'></span><input id='level' type='range' min='0' max='1' step='0.05' value='0.35'/>";

    opaclabel.style.paddingBottom = '10px';
    opaclabel.style.paddingLeft = '10px';

    const control = document.getElementById('level');
    const output = document.getElementById('output');
    function updateOpac() {
      const opacity = parseFloat(control.value);
      console.log(opacity);
      cog.setOpacity(opacity);
      output.innerText = control.value;
      console.log(control.value)

    }
    control.addEventListener('input', updateOpac);
    control.addEventListener('change', updateOpac);
    updateOpac();
  }
  

  // reset COG vis on close
  function resetCog() {
    cog.setStyle(defaultColor);
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
  content.innerHTML = "<div class='popupText'>Seafloor classification value: <strong>" + data[0] + "</strong><div class=returnVal>" + codeText + "</div></div>";
  overlay.setPosition(coordinate);
})

