import { db } from './firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Save a listing for a user
 * @param {string} userId - Firebase user ID
 * @param {Object} listing - Complete listing object
 * @returns {Promise<boolean>} Success status
 */
export async function saveListingForUser(userId, listing) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return false;
        }

        const listingRef = doc(db, 'users', userId, 'savedListings', listing.id);
        await setDoc(listingRef, {
            listing: listing,
            savedAt: new Date().toISOString(),
            timestamp: Date.now()
        });

        console.log(`Listing ${listing.id} saved for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error saving listing:', error);
        return false;
    }
}

/**
 * Remove a saved listing for a user
 * @param {string} userId - Firebase user ID
 * @param {string} listingId - Listing ID to remove
 * @returns {Promise<boolean>} Success status
 */
export async function unsaveListingForUser(userId, listingId) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return false;
        }

        const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
        await deleteDoc(listingRef);

        console.log(`Listing ${listingId} removed for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error removing listing:', error);
        return false;
    }
}

/**
 * Get all saved listings for a user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} Array of saved listings
 */
export async function getSavedListings(userId) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }

        const savedListingsRef = collection(db, 'users', userId, 'savedListings');
        const q = query(savedListingsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        const listings = snapshot.docs.map(doc => ({
            ...doc.data().listing,
            savedAt: doc.data().savedAt
        }));

        console.log(`Retrieved ${listings.length} saved listings for user ${userId}`);
        return listings;
    } catch (error) {
        console.error('Error getting saved listings:', error);
        return [];
    }
}

/**
 * Check if a listing is saved by a user
 * @param {string} userId - Firebase user ID
 * @param {string} listingId - Listing ID to check
 * @returns {Promise<boolean>} True if saved
 */
export async function isListingSaved(userId, listingId) {
    try {
        if (!db) return false;

        const listingRef = doc(db, 'users', userId, 'savedListings', listingId);
        const docSnap = await getDoc(listingRef);

        return docSnap.exists();
    } catch (error) {
        console.error('Error checking if listing is saved:', error);
        return false;
    }
}

/**
 * Add a recent search query for a user
 * @param {string} userId - Firebase user ID
 * @param {string} query - Search query
 * @returns {Promise<boolean>} Success status
 */
export async function addRecentSearch(userId, query) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return false;
        }

        // Use query as ID to avoid duplicates
        const searchId = query.toLowerCase().trim().replace(/\s+/g, '-');
        const searchRef = doc(db, 'users', userId, 'recentSearches', searchId);

        await setDoc(searchRef, {
            query: query,
            searchedAt: new Date().toISOString(),
            timestamp: Date.now()
        }, { merge: true }); // Merge to update timestamp if exists

        console.log(`Recent search "${query}" saved for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error saving recent search:', error);
        return false;
    }
}

/**
 * Get recent searches for a user
 * @param {string} userId - Firebase user ID
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of recent search queries
 */
export async function getRecentSearches(userId, maxResults = 10) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }

        const searchesRef = collection(db, 'users', userId, 'recentSearches');
        const q = query(searchesRef, orderBy('timestamp', 'desc'), limit(maxResults));
        const snapshot = await getDocs(q);

        const searches = snapshot.docs.map(doc => ({
            query: doc.data().query,
            searchedAt: doc.data().searchedAt
        }));

        console.log(`Retrieved ${searches.length} recent searches for user ${userId}`);
        return searches;
    } catch (error) {
        console.error('Error getting recent searches:', error);
        return [];
    }
}

/**
 * Clear all recent searches for a user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} Success status
 */
export async function clearRecentSearches(userId) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return false;
        }

        const searchesRef = collection(db, 'users', userId, 'recentSearches');
        const snapshot = await getDocs(searchesRef);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`Cleared ${snapshot.size} recent searches for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error clearing recent searches:', error);
        return false;
    }
}

/**
 * Get or create user preferences
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} User preferences
 */
export async function getUserPreferences(userId) {
    try {
        if (!db) {
            return { language: 'es' };
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Initialize with defaults
            const defaultPrefs = {
                language: 'es',
                createdAt: new Date().toISOString()
            };
            await setDoc(userRef, { preferences: defaultPrefs }, { merge: true });
            return defaultPrefs;
        }

        return userDoc.data().preferences || { language: 'es' };
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return { language: 'es' };
    }
}

/**
 * Update user preferences
 * @param {string} userId - Firebase user ID
 * @param {Object} preferences - Preferences to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserPreferences(userId, preferences) {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return false;
        }

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            preferences: preferences,
            lastUpdated: new Date().toISOString()
        });

        console.log(`Preferences updated for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error updating preferences:', error);
        return false;
    }
}
