import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sanitizeHTML } from './utils.js';

export class MapManager {
    constructor(mapId) {
        this.mapId = mapId;
        this.map = null;
        this.markers = {};
        this.activeMarker = null;
        this.isTransitioning = false;
        this.callbacks = {
            onMarkerClick: () => {},
            onPopupOpen: () => {},
            onPopupClose: () => {}
        };
    }

    init(center, zoom) {
        this.map = L.map(this.mapId, { zoomControl: false }).setView(center, zoom);
        L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

        this.map.on('moveend', () => {
            this.isTransitioning = false;
        });

        const tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        tileLayer.on('tileerror', () => {
            // Dispatch custom event or callback for error
            document.dispatchEvent(new CustomEvent('map:error'));
        });

        tileLayer.addTo(this.map);
    }

    addMarkers(temples) {
        temples.forEach(temple => {
            const icon = L.divIcon({
                className: 'temple-marker-container',
                html: `<div id="marker-${temple.id}" class="temple-marker"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });
            const marker = L.marker(temple.coords, { icon: icon, alt: temple.name }).addTo(this.map);

            const popupContent = `<h3>${sanitizeHTML(temple.name)}</h3><p>${sanitizeHTML(temple.description)}</p>`;
            marker.bindPopup(popupContent);

            this.markers[temple.id] = marker;

            marker.on('click', () => {
                this.callbacks.onMarkerClick(temple.id);
                this.flyTo(temple.coords);
                marker.openPopup();
            });
            marker.on('popupopen', () => this.callbacks.onPopupOpen(temple.id));
            marker.on('popupclose', () => this.callbacks.onPopupClose(temple.id));
        });
    }

    flyTo(coords) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.map.flyTo(coords, 16, { animate: true, duration: 1.5, easeLinearity: 0.25 });
    }

    openPopup(id) {
        if (this.markers[id]) {
            this.markers[id].openPopup();
        }
    }

    highlightMarker(id, shouldHighlight) {
        const el = document.getElementById(`marker-${id}`);
        if (el) {
            if (shouldHighlight) el.classList.add('highlight');
            else el.classList.remove('highlight');
        }
    }

    setActiveMarker(id) {
        this.clearActiveMarker();
        const el = document.getElementById(`marker-${id}`);
        if (el) el.classList.add('active');
        this.activeMarker = id;
    }

    clearActiveMarker() {
        if (this.activeMarker) {
            const el = document.getElementById(`marker-${this.activeMarker}`);
            if (el) el.classList.remove('active', 'highlight');
        }
        this.activeMarker = null;
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}
