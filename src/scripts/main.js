import DataManager from './DataManager.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mapManager = new MapManager('map');
    const uiManager = new UIManager();

    uiManager.initLoader();

    try {
        const temples = await DataManager.getAllTemples();

        // Initialize Map
        mapManager.init([12.84, 79.70], 14);
        mapManager.addMarkers(temples);

        // Initialize UI
        uiManager.renderList(temples);
        uiManager.hideLoader();

        // Link Interactions
        mapManager.setCallbacks({
            onMarkerClick: () => {
                // Already handled by flyTo and openPopup within mapManager
            },
            onPopupOpen: (id) => {
                mapManager.setActiveMarker(id);
                uiManager.setActiveItem(id);
            },
            onPopupClose: () => {
                mapManager.clearActiveMarker();
                uiManager.clearActiveItem();
            }
        });

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

        // Error Handling
        document.addEventListener('map:error', () => {
            uiManager.showError('Unable to load map tiles. Please check your connection.');
        });

    } catch (error) {
        uiManager.showError(`Initialization failed: ${error.message}`);
        uiManager.hideLoader();
    }
});
