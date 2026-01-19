import DataManager from './DataManager.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mapManager = new MapManager('map');
    const uiManager = new UIManager();

    uiManager.initLoader();

    try {
        console.log('Starting application initialization...');
        const temples = await DataManager.getAllTemples();
        console.log(`Loaded ${temples.length} temples.`);

        // Initialize Map
        mapManager.init([12.84, 79.70], 14);
        mapManager.addMarkers(temples);

        // Initialize UI
        uiManager.renderList(temples);

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
            console.error('Map tile error detected.');
            uiManager.showError('Unable to load map tiles. Please check your connection.');
        });

    } catch (error) {
        console.error('Initialization error:', error);
        uiManager.showError(`Initialization failed: ${error.message}`);
    } finally {
        uiManager.hideLoader();
    }
});
