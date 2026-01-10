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

    it('should set the active item', () => {
        const temples = [{ id: '1', name: 'Temple 1', era: 'Era 1' }];
        uiManager.renderList(temples);

        // Mock scrollIntoView since it's not supported in JSDOM
        const listItem = document.getElementById('item-1');
        listItem.scrollIntoView = vi.fn();

        uiManager.setActiveItem('1');

        expect(listItem.classList.contains('active')).toBe(true);
        expect(listItem.scrollIntoView).toHaveBeenCalled();
    });

    it('should clear the active item', () => {
        const temples = [{ id: '1', name: 'Temple 1', era: 'Era 1' }];
        uiManager.renderList(temples);
        const listItem = document.getElementById('item-1');
        listItem.scrollIntoView = vi.fn(); // Mock

        uiManager.setActiveItem('1');
        expect(listItem.classList.contains('active')).toBe(true);

        uiManager.clearActiveItem();
        expect(listItem.classList.contains('active')).toBe(false);
    });

    it('should show error banner', () => {
        uiManager.showError();
        expect(errorBanner.classList.contains('visible')).toBe(true);
    });
});
