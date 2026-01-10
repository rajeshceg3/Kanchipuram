import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataManager from '../../src/scripts/DataManager.js';

describe('DataManager', () => {
    it('should return all temples', async () => {
        const temples = await DataManager.getAllTemples();
        expect(temples.length).toBeGreaterThan(0);
        expect(temples[0]).toHaveProperty('id');
        expect(temples[0]).toHaveProperty('name');
    });

    it('should return a temple by id', () => {
        const temple = DataManager.getTempleById('kailasanathar');
        expect(temple).toBeDefined();
        expect(temple.name).toBe('Kailasanathar Temple');
    });

    it('should return undefined for non-existent id', () => {
        const temple = DataManager.getTempleById('non-existent');
        expect(temple).toBeUndefined();
    });
});
