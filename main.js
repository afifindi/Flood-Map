import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { Vector as VectorSource } from 'ol/source.js';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { fromLonLat } from 'ol/proj.js';
import { Icon, Style, Stroke, Fill } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';

// =========================================
// 1. SETUP DATA & LAYER
// =========================================

// --- A. DATA POLYGON ---
const riau = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    // TAMBAHKAN TANDA '/' DI DEPAN (Artinya: Cari di folder paling depan)
    url: '/data/polygon_riau.json' 
  }),
  style: new Style({
    stroke: new Stroke({
      color: '#0056b3',
      width: 2,
    }),
    fill: new Fill({
      // Transparan (0.1) biar peta di bawahnya kelihatan
      color: 'rgba(0, 100, 255, 0.1)', 
    }),
  }),
});

// --- B. DATA TITIK GENANGAN ---
const genangan = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    // TAMBAHKAN TANDA '/' DI DEPAN & GANTI SPASI JADI %20 (Biar aman dibaca browser)
    url: '/data/geo%20data%20genangan.json' 
  }),
  style: new Style({
    image: new Icon(({
      anchor: [0.5, 1],
      // TAMBAHKAN TANDA '/' DI DEPAN
      src: '/icon/Genangan%201.jpeg', 
      scale: 0.1 // Skala dikecilkan biar tidak menutupi peta
    }))
  })
});

// --- C. LAYER SATELIT ---
const satelit = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles © Esri'
  }),
  visible: false // Default mati
});

// --- D. LAYER JALAN (OSM) ---
const osmLayer = new TileLayer({
  source: new OSM(),
});


// =========================================
// 2. SETUP POPUP
// =========================================
const container = document.getElementById('popup');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: { duration: 250 },
  },
});

const popup = new Overlay({
  element: document.getElementById('popup'),
  positioning: 'top-center',
  stopEvent: false,
  offset: [0, -15]
});


// =========================================
// 3. INISIALISASI PETA
// =========================================
const map = new Map({
  target: 'map',
  overlays: [overlay, popup],
  layers: [
    osmLayer,   // Bawah
    satelit,    // Tengah
    riau,       // Atas (Polygon)
    genangan    // Paling Atas (Titik)
  ],
  view: new View({
    center: fromLonLat([101.4478, 0.5071]), 
    zoom: 12,
  }),
});


// =========================================
// 4. INTERAKSI KLIK
// =========================================
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) {
    return feat;
  });
  
  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    const props = feature.getProperties();
    
    // Ambil data (sesuaikan dengan nama kolom di JSON abang)
    const nama = props['Nama Lokasi'] || props['Name'] || 'Lokasi';
    const jenis = props['Jenis_Permukaan'] || '-';
    
    document.getElementById('popup-content').innerHTML = `
      <div style="font-size:14px; font-weight:bold; margin-bottom:5px;">${nama}</div>
      <div style="font-size:12px;">Jenis: ${jenis}</div>
    `;
    
    popup.setPosition(coordinates);
  } else {
    popup.setPosition(undefined);
  }
});

// Tombol Close Popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// Pointer Cursor
map.on('pointermove', function (e) {
  const hit = map.hasFeatureAtPixel(e.pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});


// =========================================
// 5. LOGIKA CHECKBOX
// =========================================
const polygonCheckbox = document.getElementById('waterLayer');
if (polygonCheckbox) polygonCheckbox.addEventListener('change', function () { riau.setVisible(this.checked); });

const pointCheckbox = document.getElementById('toxicLayer');
if (pointCheckbox) pointCheckbox.addEventListener('change', function () { genangan.setVisible(this.checked); });

const satelliteCheckbox = document.getElementById('satelliteLayer');
if (satelliteCheckbox) satelliteCheckbox.addEventListener('change', function () {
    satelit.setVisible(this.checked);
    osmLayer.setVisible(!this.checked); 
}); 