import DataManager from './DataManager.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const mapManager = new MapManager('map');
    const uiManager = new UIManager();

    uiManager.initLoader();

    // Initialize Map immediately
    mapManager.init([12.84, 79.70], 14);

    // Show Skeleton if available
    if (typeof uiManager.renderSkeleton === 'function') {
        uiManager.renderSkeleton();
    }

    // Hide loader immediately to show skeleton/map
    uiManager.hideLoader();

    console.log('Starting application initialization...');

    // Start data fetch
    DataManager.getAllTemples().then(temples => {
        console.log(`Loaded ${temples.length} temples.`);

        mapManager.addMarkers(temples);
        uiManager.renderList(temples);

        // Link Interactions
        uiManager.setCallbacks({
            onItemClick: (id) => {
                const temple = temples.find(t => t.id === id);
                if (temple) {
                    mapManager.flyTo(temple.coords);
                    mapManager.openPopup(id);

                }
            },
            onItemHover: (id) => {
                mapManager.highlightMarker(id, true);
            },
            onItemBlur: (id) => {
                mapManager.highlightMarker(id, false);
            }
        });

    }).catch(error => {
        console.error('Initialization error:', error);
        uiManager.showError(`Initialization failed: ${error.message}`);
    });

    document.addEventListener('temples:open', () => mapManager.map.closePopup());

    // Map interactions
    mapManager.setCallbacks({
        onMarkerClick: () => {
            // Already handled by flyTo and openPopup within mapManager
        },
        onPopupOpen: (id) => {
            mapManager.setActiveMarker(id);
            uiManager.setActiveItem(id);
            uiManager.collapsePanel();
        },
        onPopupClose: () => {
            mapManager.clearActiveMarker();
            uiManager.clearActiveItem();
            if (window.innerWidth <= 768) document.getElementById('panel-toggle')?.focus({preventScroll:true});
        }
    });

    // Error Handling
    document.addEventListener('map:error', () => {
        console.error('Map tile error detected.');
        uiManager.showError('Unable to load map tiles. Please check your connection.');
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});
