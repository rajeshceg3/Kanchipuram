import { temples } from '../data/temples.js';

class DataManager {
    constructor() {
        this.data = temples;
    }

    getAllTemples() {
        // Simulating async behavior for future API integration
        return new Promise((resolve) => {
            resolve(this.data);
        });
    }

    getTempleById(id) {
        return this.data.find(temple => temple.id === id);
    }
}

export default new DataManager();
