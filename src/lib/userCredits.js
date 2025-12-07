import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Get user's remaining credits
 * @param {string} userId - Firebase user ID
 * @returns {Promise<number>} Number of remaining credits
 */
export async function getUserCredits(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // New user - initialize with 0 credits
            await initializeUser(userId);
            return 0;
        }

        return userDoc.data().credits || 0;
    } catch (error) {
        console.error('Error getting user credits:', error);
        return 0;
    }
}

/**
 * Initialize a new user in Firestore
 * @param {string} userId - Firebase user ID
 * @param {string} email - User email
 */
async function initializeUser(userId, email = null) {
    try {
        const userRef = doc(db, 'users', userId);
        const userData = {
            uid: userId,
            email: email,
            credits: 0,
            totalPurchased: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        await setDoc(userRef, userData);
        console.log('User initialized:', userId);
    } catch (error) {
        console.error('Error initializing user:', error);
    }
}

/**
 * Add credits to user account (after successful payment)
 * @param {string} userId - Firebase user ID
 * @param {number} amount - Number of credits to add
 */
export async function addCredits(userId, amount) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Initialize user with the credits
            await setDoc(userRef, {
                uid: userId,
                credits: amount,
                totalPurchased: amount,
                lastPurchase: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        } else {
            // Update existing user
            await updateDoc(userRef, {
                credits: increment(amount),
                totalPurchased: increment(amount),
                lastPurchase: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }

        console.log(`Added ${amount} credits to user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error adding credits:', error);
        return false;
    }
}

/**
 * Deduct one credit from user (after a search)
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} True if successful
 */
export async function deductCredit(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error('User not found:', userId);
            return false;
        }

        const currentCredits = userDoc.data().credits || 0;
        if (currentCredits <= 0) {
            console.error('No credits available');
            return false;
        }

        await updateDoc(userRef, {
            credits: increment(-1),
            lastUpdated: new Date().toISOString()
        });

        console.log(`Deducted 1 credit from user ${userId}. Remaining: ${currentCredits - 1}`);
        return true;
    } catch (error) {
        console.error('Error deducting credit:', error);
        return false;
    }
}

/**
 * Check if user has credits available
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} True if user has credits
 */
export async function hasCredits(userId) {
    const credits = await getUserCredits(userId);
    return credits > 0;
}

/**
 * Get user's full credit information
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} User credit data
 */
export async function getUserCreditInfo(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return {
                credits: 0,
                totalPurchased: 0,
                lastPurchase: null
            };
        }

        const data = userDoc.data();
        return {
            credits: data.credits || 0,
            totalPurchased: data.totalPurchased || 0,
            lastPurchase: data.lastPurchase || null
        };
    } catch (error) {
        console.error('Error getting user credit info:', error);
        return {
            credits: 0,
            totalPurchased: 0,
            lastPurchase: null
        };
    }
}
