import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Shared store for notifications across tabs
export const notificationsStore = writable([]);

// Cross-tab communication for notifications
export const initCrossTabCommunication = () => {
    if (!browser) return;

    const channel = new BroadcastChannel('dd-notifications');
    
    // Listen for notifications from other tabs
    channel.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATIONS_UPDATE') {
            notificationsStore.set(event.data.notifications);
        }
    });

    return {
        broadcastNotifications: (notifications) => {
            channel.postMessage({
                type: 'NOTIFICATIONS_UPDATE',
                notifications
            });
        },
        close: () => channel.close()
    };
};

// Simple cache for layout data to reduce server requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheManager = {
    set: (key, data) => {
        if (!browser) return;
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },
    
    get: (key) => {
        if (!browser) return null;
        const cached = cache.get(key);
        if (!cached) return null;
        
        // Check if cache is still valid
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
            cache.delete(key);
            return null;
        }
        
        return cached.data;
    },
    
    clear: () => {
        if (!browser) return;
        cache.clear();
    }
};
