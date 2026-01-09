import { temples } from '../data/temples.js';
import { sanitizeHTML } from './utils.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    });

    let isTransitioning = false;

    const map = L.map('map', { zoomControl: false }).setView([12.84, 79.70], 14);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    map.on('moveend', () => {
        isTransitioning = false;
    });

    const tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    tileLayer.on('tileerror', () => {
        document.getElementById('network-error-banner').classList.add('visible');
    });

    tileLayer.addTo(map);

    const templeList = document.getElementById('temple-list');
    const markers = {};
    let activeMarker = null;

    temples.forEach(temple => {
        const icon = L.divIcon({ className: 'temple-marker-container', html: `<div id="marker-${temple.id}" class="temple-marker"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
        const marker = L.marker(temple.coords, { icon: icon, alt: temple.name }).addTo(map);

        const popupContent = `<h3>${sanitizeHTML(temple.name)}</h3><p>${sanitizeHTML(temple.description)}</p>`;
        marker.bindPopup(popupContent);

        markers[temple.id] = marker;

        const li = document.createElement('li');
        li.id = `item-${temple.id}`;
        li.innerHTML = `<h2>${sanitizeHTML(temple.name)}</h2><p>${sanitizeHTML(temple.era)}</p>`;

        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');

        const handleInteraction = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            map.flyTo(temple.coords, 16, { animate: true, duration: 1.5, easeLinearity: 0.25 });
            marker.openPopup();
        };

        li.addEventListener('click', handleInteraction);

        li.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleInteraction();
            }
        });

        li.addEventListener('mouseover', () => document.getElementById(`marker-${temple.id}`).classList.add('highlight'));
        li.addEventListener('mouseout', () => document.getElementById(`marker-${temple.id}`).classList.remove('highlight'));
        marker.on('click', handleInteraction);
        marker.on('popupopen', () => setActive(temple.id));
        marker.on('popupclose', () => clearActive());

        templeList.appendChild(li);
    });

    function setActive(templeId) {
        clearActive();
        const markerDiv = document.getElementById(`marker-${templeId}`);
        const listItem = document.getElementById(`item-${templeId}`);
        if (markerDiv) markerDiv.classList.add('active');
        if (listItem) {
            listItem.classList.add('active');
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        activeMarker = templeId;
    }

    function clearActive() {
        if (activeMarker) {
            const oldMarkerDiv = document.getElementById(`marker-${activeMarker}`);
            const oldListItem = document.getElementById(`item-${activeMarker}`);
            if(oldMarkerDiv) oldMarkerDiv.classList.remove('active', 'highlight');
            if(oldListItem) oldListItem.classList.remove('active');
        }
        activeMarker = null;
    }
});
