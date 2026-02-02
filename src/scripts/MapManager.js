import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

        this.map.on('moveend', () => {
            this.isTransitioning = false;
        });

        const tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        tileLayer.on('tileerror', () => {
            // Dispatch custom event or callback for error
            document.dispatchEvent(new CustomEvent('map:error'));
        });

        tileLayer.addTo(this.map);
    }

    /**
     * Adds markers to the map.
     * @param {Temple[]} temples - Array of temple objects.
     */
    addMarkers(temples) {
        temples.forEach(temple => {
            const icon = L.divIcon({
                className: 'temple-marker-container',
                html: `<div id="marker-${temple.id}" class="temple-marker" role="button" aria-label="Marker for ${sanitizeHTML(temple.name)}" tabindex="0"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });
            const marker = L.marker(temple.coords, { icon: icon, alt: temple.name }).addTo(this.map);

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
                        <h4><span class="section-icon">📜</span> Myth & Legend</h4>
                        <p class="section-text">${sanitizeHTML(temple.mythology)}</p>
                    </div>` : ''}

                    ${temple.architecturalHighlight ? `
                    <div class="popup-section">
                        <h4><span class="section-icon">🏛️</span> Architecture Focus</h4>
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
                            <strong>📸 Pro Tip:</strong> ${sanitizeHTML(temple.photographyTip)}
                        </div>` : ''}
                    </div>
                    <div class="popup-actions">
                         <a href="https://www.google.com/maps/dir/?api=1&destination=${temple.coords[0]},${temple.coords[1]}" target="_blank" rel="noopener noreferrer" class="btn-directions">
                            Get Directions
                        </a>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent, { maxWidth: 300 });

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
