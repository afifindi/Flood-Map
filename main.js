import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { Vector as VectorSource } from 'ol/source.js';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { fromLonLat } from 'ol/proj.js';
import { Icon, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';


const riau = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    // url: 'data/polygon_riau.json',
    url: 'data/polygon_pekanbaru.json'
    // url: 'data/poligon_kota_pekanbaru_gabungan.geojson'
  }),
  style: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'OBJECTID'],
      1,
      '#ffff33',
      1283,
      '#3358ff',
    ],
  },
});


const genangan = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'data/geo data genangan.json'
  }),
  style: new Style({
    image: new Icon(({
      anchor: [0.5, 46],
      anchorXUnits: 'flaticon',
      anchorYUnits: 'pixels',
      src: 'icon/Genangan 1.jpeg',
      width: 32,
      height: 32
    }))
  })
});

// const banjir = new VectorLayer({
//   source: new VectorSource({
//     format: new GeoJSON(),
//     url: 'data/banjir.json'
//   }),
//   style: new Style({
//     image: new Icon(({
//       anchor: [0.5, 46],
//       anchorXUnits: 'flaticon',
//       anchorYUnits: 'pixels',
//       src: 'icon/flood.png',
//       width: 32,
//       height: 32
//     }))
//   })
// });

const container = document.getElementById('popup');
const content_element = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const map = new Map({
  target: 'map',
  overlays: [overlay],
  layers: [
    new TileLayer({
      source: new OSM(),
    }), riau, genangan// memanggil variabel data

  ],
  view: new View({
    center: fromLonLat([101.438309, 0.510440]),
    zoom: 7,
  }),
});

const popup = new Overlay({
  element: document.getElementById('popup'),
  positioning: 'top-center',
  stopEvent: false,
  offset: [0, -15]
});

map.addOverlay(popup);
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
    return feat;
  });
  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    let content = '<h3>Informasi Fitur</h3>';
    content += '<h3>Nama Lokasi: ' + feature.get('Nama Lokasi') + '</h3>' + '<p>Jenis Permukaan: ' + feature.get('Jenis_Permukaan') + '</p>Kondisi Drainase: ' + feature.get('Kondisi_drainase');
    document.getElementById('popup-content').innerHTML = content;
    popup.setPosition(coordinates);
  } else {
    popup.setPosition(undefined);
  }
});

map.addOverlay(overlay); //untuk menambah overlay
// JS for click popup
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (!feature) {
    return;
  }
  const coordinate = evt.coordinate;
  const content = '<h3>Nama Lokasi: ' + feature.get('Nama Lokasi') + '</h3>' + '<p>Jenis Permukaan: ' + feature.get('Jenis_Permukaan') + '</p>Kondisi Drainase: ' + feature.get('Kondisi_drainase');
  content_element.innerHTML = content;
  overlay.setPosition(coordinate);
});

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: {
    'stroke-color': 'rgba(255, 255, 255, 0.7)',
    'stroke-width': 2,
  },
});

let highlight;
const highlightFeature = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });
  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feat) {
    return feat;
  });
  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('DESA') || '&nbsp; ';
  } else {
    info.innerHTML = '&nbsp;';
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    popup.setPosition(undefined);
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  highlightFeature(pixel);
  displayFeatureInfo(pixel);
});

const polygonLayerCheckbox = document.getElementById('polygon');
const pointLayerCheckbox = document.getElementById('point');
polygonLayerCheckbox.addEventListener('change', function () {
  riau.setVisible(polygonLayerCheckbox.checked);
});
pointLayerCheckbox.addEventListener('change', function () {
  genangan.setVisible(pointLayerCheckbox.checked);
});

//Click handler to hide popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};