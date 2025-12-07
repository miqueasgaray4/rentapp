import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached search results if available and fresh
 * @param {string} searchQuery - The search query
 * @returns {Promise<Array|null>} Cached listings or null if not found/expired
 */
export async function getCachedSearch(searchQuery) {
    try {
        const normalizedQuery = searchQuery.toLowerCase().trim();
        const cacheRef = doc(db, 'searchCache', normalizedQuery);
        const cacheDoc = await getDoc(cacheRef);

        if (!cacheDoc.exists()) {
            console.log('Cache miss: No cached results found');
            return null;
        }

        const cacheData = cacheDoc.data();
        const now = Date.now();

        // Check if cache is still valid
        if (now > cacheData.expiresAt) {
            console.log('Cache expired');
            return null;
        }

        console.log('Cache hit: Returning cached results');
        return cacheData.results;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

/**
 * Store search results in cache
 * @param {string} searchQuery - The search query
 * @param {Array} results - The search results to cache
 */
export async function setCachedSearch(searchQuery, results) {
    try {
        const normalizedQuery = searchQuery.toLowerCase().trim();
        const now = Date.now();

        const cacheData = {
            query: normalizedQuery,
            results: results,
            timestamp: now,
            expiresAt: now + CACHE_DURATION_MS,
            createdAt: new Date().toISOString()
        };

        const cacheRef = doc(db, 'searchCache', normalizedQuery);
        await setDoc(cacheRef, cacheData);

        console.log('Search results cached successfully');
    } catch (error) {
        console.error('Error caching search results:', error);
        // Don't throw - caching failure shouldn't break the app
    }
}

/**
 * Check if a timestamp is still valid (within cache duration)
 * @param {number} timestamp - The timestamp to check
 * @returns {boolean} True if still valid
 */
export function isCacheValid(timestamp) {
    const now = Date.now();
    return (now - timestamp) < CACHE_DURATION_MS;
}

/**
 * Clear expired cache entries (for maintenance)
 */
export async function clearExpiredCache() {
    try {
        const now = Date.now();
        const cacheRef = collection(db, 'searchCache');
        const expiredQuery = query(cacheRef, where('expiresAt', '<', now));

        const snapshot = await getDocs(expiredQuery);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

        await Promise.all(deletePromises);
        console.log(`Cleared ${snapshot.size} expired cache entries`);
    } catch (error) {
        console.error('Error clearing expired cache:', error);
    }
}
