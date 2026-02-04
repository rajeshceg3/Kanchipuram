import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UIManager } from '../../src/scripts/UIManager.js';

describe('UIManager', () => {
    let uiManager;
    let listElement;
    let loaderElement;
    let errorBanner;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="loader"></div>
            <ul id="temple-list"></ul>
            <div id="network-error-banner" class="network-error"></div>
        `;
        listElement = document.getElementById('temple-list');
        loaderElement = document.getElementById('loader');
        errorBanner = document.getElementById('network-error-banner');

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        uiManager = new UIManager();
    });

    it('should render the list of temples', () => {
        const temples = [
            { id: '1', name: 'Temple 1', era: 'Era 1' },
            { id: '2', name: 'Temple 2', era: 'Era 2' }
        ];

        uiManager.renderList(temples);

        const listItems = listElement.querySelectorAll('li');
        expect(listItems.length).toBe(2);
        expect(listItems[0].textContent).toContain('Temple 1');
        expect(listItems[0].textContent).toContain('Era 1');
    });

    it('should set the active item with smooth scroll when reduced motion is disabled', () => {
        const temples = [{ id: '1', name: 'Temple 1', era: 'Era 1' }];
        uiManager.renderList(temples);

        // Mock scrollIntoView since it's not supported in JSDOM
        const listItem = document.getElementById('item-1');
        listItem.scrollIntoView = vi.fn();

        uiManager.setActiveItem('1');

        const btn = listItem.querySelector('.temple-card-btn');
        expect(btn.classList.contains('active')).toBe(true);
        expect(listItem.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
    });

    it('should set the active item with auto scroll when reduced motion is enabled', () => {
        // Mock reduced motion preference
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

        const temples = [{ id: '1', name: 'Temple 1', era: 'Era 1' }];
        uiManager.renderList(temples);

        // Mock scrollIntoView
        const listItem = document.getElementById('item-1');
        listItem.scrollIntoView = vi.fn();

        uiManager.setActiveItem('1');

        const btn = listItem.querySelector('.temple-card-btn');
        expect(btn.classList.contains('active')).toBe(true);
        expect(listItem.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'nearest' });
    });

    it('should clear the active item', () => {
        const temples = [{ id: '1', name: 'Temple 1', era: 'Era 1' }];
        uiManager.renderList(temples);
        const listItem = document.getElementById('item-1');
        listItem.scrollIntoView = vi.fn(); // Mock

        uiManager.setActiveItem('1');
        const btn = listItem.querySelector('.temple-card-btn');
        expect(btn.classList.contains('active')).toBe(true);

        uiManager.clearActiveItem();
        expect(btn.classList.contains('active')).toBe(false);
    });

    it('should show error banner', () => {
        uiManager.showError();
        expect(errorBanner.classList.contains('visible')).toBe(true);
    });

    it('should hide loader when hideLoader is called (fallback)', () => {
        // Mock setTimeout
        vi.useFakeTimers();

        uiManager.hideLoader();
        expect(loaderElement.classList.contains('fade-out')).toBe(true);

        // Advance timers by enough time to trigger the safety fallback (1100ms)
        vi.advanceTimersByTime(1100);
        expect(loaderElement.classList.contains('hidden')).toBe(true);

        vi.useRealTimers();
    });

    it('should hide loader immediately on transitionend', () => {
        uiManager.hideLoader();
        expect(loaderElement.classList.contains('fade-out')).toBe(true);

        // Simulate transitionend event
        const event = new Event('transitionend');
        Object.defineProperty(event, 'target', { value: loaderElement });
        loaderElement.dispatchEvent(event);

        expect(loaderElement.classList.contains('hidden')).toBe(true);
    });
});
