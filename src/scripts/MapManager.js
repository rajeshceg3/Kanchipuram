import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import warmMapStyle from '../vendor/warm-map/style.json';
import { sanitizeHTML } from './utils.js';

/**
 * @typedef {import('./DataManager.js').Temple} Temple
 */

export class MapManager {
    /**
     * @param {string} mapId - The DOM ID of the map container.
     */
    constructor(mapId) {
        this.mapId = mapId;
        /** @type {L.Map | null} */
        this.map = null;
        /** @type {Object.<string, L.Marker>} */
        this.markers = {};
        /** @type {string | null} */
        this.activeMarker = null;
        this.isTransitioning = false;
        this.callbacks = {
            /** @type {(id: string) => void} */
            onMarkerClick: () => {},
            /** @type {(id: string) => void} */
            onPopupOpen: () => {},
            /** @type {(id: string) => void} */
            onPopupClose: () => {}
        };
    }

    /**
     * Initializes the Leaflet map.
     * @param {[number, number]} center - Initial center coordinates.
     * @param {number} zoom - Initial zoom level.
     */
    init(center, zoom) {
        this.map = L.map(this.mapId, { zoomControl: false }).setView(center, zoom);
        L.control.zoom({ position: 'bottomleft' }).addTo(this.map);
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => this.map.closePopup());

        this.map.on('moveend', () => {
            this.isTransitioning = false;
        });

        // Warm paper basemap (worlds shared module): OpenFreeMap vector tiles,
        // custom watercolor-wash style. Free public instance, no API key.
        const glLayer = maplibreGL({ style: warmMapStyle });
        glLayer.addTo(this.map);

        this.map.attributionControl.addAttribution('<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>');

        const glMap = glLayer.getMaplibreMap();
        glMap.on('error', () => {
            // Dispatch custom event or callback for error
            document.dispatchEvent(new CustomEvent('map:error'));
        });
    }

    /**
     * Adds markers to the map.
     * @param {Temple[]} temples - Array of temple objects.
     */
    addMarkers(temples) {
        temples.forEach(temple => {
            const icon = L.divIcon({
                className: 'temple-marker-container',
                html: `<div id="marker-${temple.id}" class="temple-marker"></div>`,
                iconSize: [44, 44],
                iconAnchor: [22, 22]
            });
            const marker = L.marker(temple.coords, { icon: icon, title: temple.name, alt: temple.name }).addTo(this.map);

            const popupContent = `
                <div class="popup-content-inner">
                    <h3>${sanitizeHTML(temple.name)}</h3>
                    <div class="popup-meta">
                        <span class="popup-badge">${sanitizeHTML(temple.era)}</span>
                        <span class="popup-badge">${sanitizeHTML(temple.architecture)}</span>
                    </div>
                    <p class="popup-desc">${sanitizeHTML(temple.description)}</p>

                    ${temple.mythology ? `
                    <div class="popup-section">
                        <h4>Myth & Legend</h4>
                        <p class="section-text">${sanitizeHTML(temple.mythology)}</p>
                    </div>` : ''}

                    ${temple.architecturalHighlight ? `
                    <div class="popup-section">
                        <h4>Architecture Focus</h4>
                        <p class="section-text">${sanitizeHTML(temple.architecturalHighlight)}</p>
                    </div>` : ''}

                    <div class="popup-details">
                        <div class="detail-row">
                            <strong>Highlight:</strong> ${sanitizeHTML(temple.specialty)}
                        </div>

                        ${temple.festivals && temple.festivals.length ? `
                        <div class="detail-row">
                            <strong>Festivals:</strong> ${sanitizeHTML(temple.festivals.join(', '))}
                        </div>` : ''}

                        <div class="detail-row">
                            <strong>Timings:</strong> ${sanitizeHTML(temple.hours)}
                        </div>

                        ${temple.visitInfo ? `
                        <div class="detail-row popup-visit-separator">
                            <strong>Best Time:</strong> ${sanitizeHTML(temple.visitInfo.bestTime)}
                        </div>
                        <div class="detail-row">
                            <strong>Visit Duration:</strong> ${sanitizeHTML(temple.visitInfo.duration)}
                        </div>
                        <div class="detail-row">
                            <strong>Dress Code:</strong> ${sanitizeHTML(temple.visitInfo.dressCode)}
                        </div>
                        ` : ''}

                         ${temple.photographyTip ? `
                        <div class="photography-tip">
                            <strong>Photography:</strong> ${sanitizeHTML(temple.photographyTip)}
                        </div>` : ''}
                    </div>
                    <p class="planning-note">Planning notes, not live opening hours. Confirm access and timings before visiting.</p>
                    <div class="popup-actions">
                         <a href="https://www.google.com/maps/dir/?api=1&destination=${temple.coords[0]},${temple.coords[1]}" target="_blank" rel="noopener noreferrer" class="btn-directions">
                            Get Directions
                        </a>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent, { maxWidth: 360, autoPan: window.innerWidth > 768, className: 'temple-story' });

            this.markers[temple.id] = marker;

            marker.on('click', () => {
                this.callbacks.onMarkerClick(temple.id);
                this.flyTo(temple.coords);
                marker.openPopup();
            });
            marker.on('popupopen', () => {
                this.callbacks.onPopupOpen(temple.id);
                const el = marker.getPopup().getElement();
                document.getElementById('app-container').appendChild(el);
                el.setAttribute('role', 'dialog');
                el.setAttribute('aria-label', temple.name);
                const close = el.querySelector('.leaflet-popup-close-button');
                close.setAttribute('aria-label', 'Close story');
                close.focus({preventScroll:true});
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {e.preventDefault(); this.map.closePopup();}
                    if (e.key === 'Tab') {
                        const nodes = [...el.querySelectorAll('a[href],button')];
                        if (e.shiftKey && document.activeElement === nodes[0]) {e.preventDefault();nodes.at(-1).focus();}
                        else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {e.preventDefault();nodes[0].focus();}
                    }
                });
            });
            marker.on('popupclose', () => this.callbacks.onPopupClose(temple.id));
        });
    }

    /**
     * smooth fly to coordinates.
     * @param {[number, number]} coords
     */
    flyTo(coords) {
        if (this.isTransitioning || !this.map) return;

        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            this.map.setView(coords, 16);
            return;
        }

        this.isTransitioning = true;
        this.map.flyTo(coords, 16, { animate: true, duration: 1.5, easeLinearity: 0.25 });
    }

    /**
     * Opens the popup for a specific marker.
     * @param {string} id
     */
    openPopup(id) {
        if (this.markers[id]) {
            this.markers[id].openPopup();
        }
    }

    /**
     * Highlights a marker visually.
     * @param {string} id
     * @param {boolean} shouldHighlight
     */
    highlightMarker(id, shouldHighlight) {
        const el = document.getElementById(`marker-${id}`);
        if (el) {
            if (shouldHighlight) el.classList.add('highlight');
            else el.classList.remove('highlight');
        }
    }

    /**
     * Sets a marker as active (persistent highlight).
     * @param {string} id
     */
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
