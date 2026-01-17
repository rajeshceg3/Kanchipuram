import { sanitizeHTML } from './utils.js';

/**
 * @typedef {import('./DataManager.js').Temple} Temple
 */

export class UIManager {
    constructor() {
        this.loader = document.getElementById('loader');
        this.listElement = document.getElementById('temple-list');
        this.errorBanner = document.getElementById('network-error-banner');
        this.panel = document.getElementById('panel');
        this.panelToggle = document.getElementById('panel-toggle');
        this.activeItem = null;
        this.callbacks = {
            /** @type {(id: string) => void} */
            onItemClick: () => {},
            /** @type {(id: string) => void} */
            onItemHover: () => {},
            /** @type {(id: string) => void} */
            onItemBlur: () => {}
        };
    }

    initLoader() {
        // Initialize mobile toggle
        if (this.panelToggle && this.panel) {
            this.panelToggle.addEventListener('click', () => {
                const isHidden = this.panel.classList.toggle('hidden-mobile');
                this.panelToggle.classList.toggle('collapsed');
                this.panelToggle.setAttribute('aria-expanded', !isHidden);
            });
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('fade-out');
            setTimeout(() => {
                this.loader.classList.add('hidden');
            }, 1000);
        }
    }

    /**
     * Renders the list of temples.
     * @param {Temple[]} temples
     */
    renderList(temples) {
        if (!this.listElement) return;
        this.listElement.innerHTML = '';
        temples.forEach(temple => {
            const li = document.createElement('li');
            li.id = `item-${temple.id}`;
            li.innerHTML = `
                <h2>${sanitizeHTML(temple.name)}</h2>
                <div class="meta-badges">
                    <span class="badge badge-deity">${sanitizeHTML(temple.deity)}</span>
                    <span class="badge badge-arch">${sanitizeHTML(temple.architecture)}</span>
                </div>
                <p>${sanitizeHTML(temple.era)}</p>
            `;
            li.setAttribute('role', 'button');
            li.setAttribute('tabindex', '0');
            li.setAttribute('aria-label', `Select ${temple.name}, dedicated to ${temple.deity}`);

            li.addEventListener('click', () => this.callbacks.onItemClick(temple.id));
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent scrolling for Space
                    this.callbacks.onItemClick(temple.id);
                }
            });
            li.addEventListener('mouseover', () => this.callbacks.onItemHover(temple.id));
            li.addEventListener('mouseout', () => this.callbacks.onItemBlur(temple.id));
            li.addEventListener('focus', () => this.callbacks.onItemHover(temple.id)); // Accessibility: hover effect on focus
            li.addEventListener('blur', () => this.callbacks.onItemBlur(temple.id));

            this.listElement.appendChild(li);
        });
    }

    /**
     * Sets the active item in the list.
     * @param {string} id
     */
    setActiveItem(id) {
        this.clearActiveItem();
        const li = document.getElementById(`item-${id}`);
        if (li) {
            li.classList.add('active');
            li.setAttribute('aria-selected', 'true');

            // Accessibility: Respect user's motion preference
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const behavior = prefersReducedMotion ? 'auto' : 'smooth';

            li.scrollIntoView({ behavior, block: 'nearest' });
        }
        this.activeItem = id;
    }

    clearActiveItem() {
        if (this.activeItem) {
            const li = document.getElementById(`item-${this.activeItem}`);
            if (li) {
                li.classList.remove('active');
                li.setAttribute('aria-selected', 'false');
            }
        }
        this.activeItem = null;
    }

    showError(message = 'An error occurred while loading data.') {
        if (this.errorBanner) {
            this.errorBanner.textContent = message;
            this.errorBanner.classList.add('visible');
            this.errorBanner.setAttribute('role', 'alert');
        }
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}
