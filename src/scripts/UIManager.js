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
        if (!this.loader) return;

        const onTransitionEnd = (e) => {
            if (e.target !== this.loader) return;
            this.loader.classList.add('hidden');
            this.loader.removeEventListener('transitionend', onTransitionEnd);
        };

        this.loader.addEventListener('transitionend', onTransitionEnd);

        // Force reflow to ensure transition works if element was just added/shown
        void this.loader.offsetWidth;

        this.loader.classList.add('fade-out');

        // Safety fallback in case transitionend doesn't fire
        setTimeout(() => {
            if (!this.loader.classList.contains('hidden')) {
                this.loader.classList.add('hidden');
                this.loader.removeEventListener('transitionend', onTransitionEnd);
            }
        }, 1100);
    }

    /**
     * Renders the list of temples.
     * @param {Temple[]} temples
     */
    renderSkeleton() {
        if (!this.listElement) return;
        this.listElement.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const li = document.createElement('li');
            li.className = 'skeleton-item';
            li.setAttribute('aria-hidden', 'true');
            li.innerHTML = `
                <div class="skeleton-title"></div>
                <div class="skeleton-badges">
                    <div class="skeleton-badge"></div>
                    <div class="skeleton-badge"></div>
                </div>
                <div class="skeleton-text"></div>
            `;
            this.listElement.appendChild(li);
        }
    }

    renderList(temples) {
        if (!this.listElement) return;
        this.listElement.innerHTML = '';
        temples.forEach(temple => {
            const li = document.createElement('li');
            li.id = `item-${temple.id}`;
            li.className = 'temple-item'; // Class for structural styling

            const btn = document.createElement('button');
            btn.className = 'temple-card-btn';
            btn.setAttribute('aria-label', `Select ${temple.name}, dedicated to ${temple.deity}`);
            btn.innerHTML = `
                <h2>${sanitizeHTML(temple.name)}</h2>
                <div class="meta-badges">
                    <span class="badge badge-deity">${sanitizeHTML(temple.deity)}</span>
                    <span class="badge badge-arch">${sanitizeHTML(temple.architecture)}</span>
                </div>
                <p>${sanitizeHTML(temple.era)}</p>
                <div class="list-highlight">
                    <span class="icon-star">✦</span> ${sanitizeHTML(temple.specialty)}
                </div>
                ${temple.visitInfo ? `<div class="list-visit-info">
                     <span class="list-visit-label">Est. Duration:</span> ${sanitizeHTML(temple.visitInfo.duration)}
                </div>` : ''}
            `;

            btn.addEventListener('click', () => this.callbacks.onItemClick(temple.id));
            // Standard buttons handle Enter/Space natively, no need for keydown
            btn.addEventListener('mouseover', () => this.callbacks.onItemHover(temple.id));
            btn.addEventListener('mouseout', () => this.callbacks.onItemBlur(temple.id));
            btn.addEventListener('focus', () => this.callbacks.onItemHover(temple.id));
            btn.addEventListener('blur', () => this.callbacks.onItemBlur(temple.id));

            li.appendChild(btn);
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
            const btn = li.querySelector('.temple-card-btn');
            if (btn) btn.classList.add('active');
            // aria-selected is not valid for buttons in a list (unless role=listbox)
            // We use visual indication and focus management.

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
                const btn = li.querySelector('.temple-card-btn');
                if (btn) btn.classList.remove('active');
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
