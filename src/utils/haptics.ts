/**
 * Safe wrapper for browser vibration API
 */
export const haptics = {
    /**
     * Short subtle vibration for clicks/toggles
     */
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    /**
     * Success pattern: medium vibration
     */
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([20, 30, 20]);
        }
    },

    /**
     * Error pattern: multiple short vibrations
     */
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
        }
    }
};
