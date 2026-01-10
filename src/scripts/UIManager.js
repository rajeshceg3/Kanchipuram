import { sanitizeHTML } from './utils.js';

export class UIManager {
    constructor() {
        this.loader = document.getElementById('loader');
        this.listElement = document.getElementById('temple-list');
        this.errorBanner = document.getElementById('network-error-banner');
        this.callbacks = {
            onItemClick: () => {},
            onItemHover: () => {},
            onItemBlur: () => {}
        };
    }

    initLoader() {
        window.addEventListener('load', () => {
            this.loader.classList.add('fade-out');
            setTimeout(() => {
                this.loader.classList.add('hidden');
            }, 1000);
        });
    }

    renderList(temples) {
        this.listElement.innerHTML = '';
        temples.forEach(temple => {
            const li = document.createElement('li');
            li.id = `item-${temple.id}`;
            li.innerHTML = `<h2>${sanitizeHTML(temple.name)}</h2><p>${sanitizeHTML(temple.era)}</p>`;
            li.setAttribute('role', 'button');
            li.setAttribute('tabindex', '0');

            li.addEventListener('click', () => this.callbacks.onItemClick(temple.id));
            li.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.callbacks.onItemClick(temple.id);
                }
            });
            li.addEventListener('mouseover', () => this.callbacks.onItemHover(temple.id));
            li.addEventListener('mouseout', () => this.callbacks.onItemBlur(temple.id));

            this.listElement.appendChild(li);
        });
    }

    setActiveItem(id) {
        this.clearActiveItem();
        const li = document.getElementById(`item-${id}`);
        if (li) {
            li.classList.add('active');
            li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.activeItem = id;
    }

    clearActiveItem() {
        if (this.activeItem) {
            const li = document.getElementById(`item-${this.activeItem}`);
            if (li) li.classList.remove('active');
        }
        this.activeItem = null;
    }

    showError() {
        this.errorBanner.classList.add('visible');
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}
