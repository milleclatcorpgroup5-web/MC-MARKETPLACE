// M.C Marketplace V4.0.1
// mc-analytics.js
// Lightweight client-side analytics helper
// No payment logic / no external dependency

(function (window) {
  'use strict';

  const STORAGE_KEY = 'mc_marketplace_analytics_v4';
  const MAX_EVENTS = 100;

  const MCAnalytics = {
    version: '4.0.1',

    track(eventName, data = {}) {
      if (!eventName) return false;

      const event = {
        event: String(eventName),
        data: data && typeof data === 'object' ? data : {},
        timestamp: new Date().toISOString()
      };

      try {
        const existing = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        const events = Array.isArray(existing) ? existing : [];

        events.push(event);

        while (events.length > MAX_EVENTS) {
          events.shift();
        }

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(events)
        );
      } catch (error) {
        console.warn(
          'MCAnalytics: local storage unavailable',
          error
        );
      }

      try {
        window.dispatchEvent(
          new CustomEvent('mc:analytics', {
            detail: event
          })
        );
      } catch (error) {
        console.warn(
          'MCAnalytics: event dispatch failed',
          error
        );
      }

      return true;
    },

    getEvents() {
      try {
        const events = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        return Array.isArray(events) ? events : [];
      } catch (error) {
        return [];
      }
    },

    clear() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  window.MCAnalytics = MCAnalytics;

})(window);
