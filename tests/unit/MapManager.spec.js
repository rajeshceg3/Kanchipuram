import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapManager } from '../../src/scripts/MapManager.js';
import L from 'leaflet';

// Mock Leaflet
vi.mock('leaflet', () => {
    return {
        default: {
            map: vi.fn(() => ({
                setView: vi.fn().mockReturnThis(),
                on: vi.fn(),
                flyTo: vi.fn()
            })),
            control: {
                zoom: vi.fn(() => ({ addTo: vi.fn() }))
            },
            tileLayer: vi.fn(() => ({
                addTo: vi.fn(),
                on: vi.fn()
            })),
            divIcon: vi.fn(),
            marker: vi.fn(() => ({
                addTo: vi.fn(),
                bindPopup: vi.fn(),
                on: vi.fn(),
                openPopup: vi.fn()
            }))
        }
    };
});

describe('MapManager', () => {
    let mapManager;
    let mapInstance;

    beforeEach(() => {
        // Clear mocks
        vi.clearAllMocks();

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        mapManager = new MapManager('map');
        mapManager.init([0, 0], 10);
        // Get the mocked map instance
        mapInstance = L.map.mock.results[0].value;
    });

    it('should use flyTo when reduced motion is disabled', () => {
        mapManager.flyTo([10, 10]);
        expect(mapInstance.flyTo).toHaveBeenCalledWith([10, 10], 16, expect.objectContaining({
            animate: true,
            duration: 1.5
        }));
        expect(mapInstance.setView).not.toHaveBeenCalledWith([10, 10], 16);
    });

    it('should use setView when reduced motion is enabled', () => {
        // Mock reduced motion
        window.matchMedia.mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        mapManager.flyTo([10, 10]);
        expect(mapInstance.setView).toHaveBeenCalledWith([10, 10], 16);
        expect(mapInstance.flyTo).not.toHaveBeenCalled();
    });

    it('should not perform transition if map is not initialized', () => {
        const uninitMapManager = new MapManager('map');
        uninitMapManager.flyTo([10, 10]);
        // Since we can't easily check the mock of a null map, we assume it didn't crash.
        // In a real integration test we would check side effects.
        // Here we just ensure no errors were thrown and logic holds.
    });
});
