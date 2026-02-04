import { temples } from '../data/temples.js';

/**
 * @typedef {Object} Temple
 * @property {string} id - Unique identifier for the temple
 * @property {string} name - Name of the temple
 * @property {string} era - Historical era of construction
 * @property {[number, number]} coords - Latitude and Longitude
 * @property {string} description - Brief description
 */

class DataManager {
    constructor() {
        /** @type {Temple[]} */
        this.data = temples;
    }

    /**
     * Retrieves all temples.
     * Simulates an asynchronous API call.
     * @returns {Promise<Temple[]>} A promise that resolves to an array of temples.
     */
    getAllTemples() {
        // Simulating async behavior for future API integration
        return new Promise((resolve) => {
            setTimeout(() => {
                // Return a deep copy to prevent mutation of the source of truth
                resolve(structuredClone(this.data));
            }, 300); // Added slight delay to make loader visible and test realistic async
        });
    }

    /**
     * Retrieves a specific temple by ID.
     * @param {string} id - The ID of the temple to retrieve.
     * @returns {Temple | undefined} The temple object if found, otherwise undefined.
     */
    getTempleById(id) {
        const temple = this.data.find(temple => temple.id === id);
        return temple ? structuredClone(temple) : undefined;
    }
}

export default new DataManager();
