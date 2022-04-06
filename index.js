const bathy = {
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
                "raster-opacity": 0.75,
                "raster-resampling": "linear",
                "raster-brightness-max": 1.0,
                "raster-brightness-min": 0.5,
                "raster-contrast": 0,
                "raster-opacity": {
                    "stops": [
                    [1, 0.35],
                    [7, 0.35],
                    [8, 0.65],
                    [15, 0.65],
                    [16, 0.3]
                    ]
                },
            }
        },
        {
            "id": "hs_raster",
            "source": "hs_raster",
            "type": "raster",
            "layout": { "visibility": "visible" },
            "paint": {
                "raster-opacity": 0.75,
                "raster-resampling": "linear",
                "raster-brightness-max": 1.0,
                "raster-brightness-min": 0.5,
                "raster-contrast": 0,
                "raster-opacity": {
                    "stops": [
                      [1, 0.35],
                      [7, 0.35],
                      [8, 0.65],
                      [15, 0.65],
                      [16, 0.3]
                    ]
                  },
                }
        }
    ]
}

const map = new maplibregl.Map({
    container: 'map',
    style: bathy,
    "center": [174.0,-41.29],
    "zoom": 9,
    });

const mapOverlay = new maplibregl.Map({
    container: 'mapOverlay',
    style: 'style/style.json',
    "center": [174.0,-41.29],
    "zoom": 9,
    });

syncMaps(map, mapOverlay);