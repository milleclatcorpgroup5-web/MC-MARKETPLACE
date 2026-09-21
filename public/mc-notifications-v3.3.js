// M.C Marketplace V4.0.1
// mc-notifications-v3.3.js
// Device notification helper
// Payment-independent / Firebase Messaging compatible

(function (window) {
  'use strict';

  const MCNotifications = {
    version: '3.3',

    async enable(options = {}) {
      try {
        const {
          uid,
          db,
          doc,
          setDoc,
          getToken,
          getMessaging,
          initializeApp,
          firebaseConfig
        } = options;

        if (!uid) {
          throw new Error('MCNotifications: uid is required');
        }

        if (!('Notification' in window)) {
          throw new Error('Notifications are not supported by this browser');
        }

        if (!getToken || !getMessaging) {
          throw new Error('Firebase Messaging functions are missing');
        }

        // Ask permission from the user.
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          return {
            success: false,
            permission,
            token: null
          };
        }

        // Wait for the registered service worker when available.
        let registration = null;

        if ('serviceWorker' in navigator) {
          try {
            registration = await navigator.serviceWorker.ready;
          } catch (error) {
            console.warn(
              'MCNotifications: service worker not ready',
              error
            );
          }
        }

        // Initialize Firebase Messaging.
        let firebaseApp = null;

        if (typeof initializeApp === 'function' && firebaseConfig) {
          try {
            firebaseApp = initializeApp(firebaseConfig);
          } catch (error) {
            // Firebase may already be initialized.
            if (
              error &&
              (
                error.code === 'app/duplicate-app' ||
                String(error.message || '').toLowerCase().includes('already exists')
              )
            ) {
              console.warn(
                'MCNotifications: Firebase app already initialized'
              );
            } else {
              throw error;
            }
          }
        }

        let messaging;

        if (firebaseApp) {
          messaging = getMessaging(firebaseApp);
        } else {
          messaging = getMessaging();
        }

        const tokenOptions = {};

        if (registration) {
          tokenOptions.serviceWorkerRegistration = registration;
        }

        /*
         * The Firebase configuration must provide the correct
         * VAPID key through the Firebase Messaging setup.
         *
         * If getToken requires a VAPID key in your project,
         * the caller can pass it as options.vapidKey.
         */
        if (options.vapidKey) {
          tokenOptions.vapidKey = options.vapidKey;
        }

        const token = await getToken(
          messaging,
          tokenOptions
        );

        if (!token) {
          return {
            success: false,
            permission,
            token: null
          };
        }

        // Save the device token when Firestore functions are provided.
        if (
          db &&
          typeof doc === 'function' &&
          typeof setDoc === 'function'
        ) {
          try {
            const tokenRef = doc(
              db,
              'device_tokens',
              uid
            );

            await setDoc(
              tokenRef,
              {
                uid: uid,
                token: token,
                updatedAt: new Date().toISOString(),
                platform: navigator.platform || 'web',
                userAgent: navigator.userAgent || 'unknown'
              },
              {
                merge: true
              }
            );
          } catch (error) {
            console.warn(
              'MCNotifications: unable to save device token',
              error
            );
          }
        }

        return {
          success: true,
          permission,
          token
        };

      } catch (error) {
        console.error(
          'MCNotifications.enable error:',
          error
        );

        return {
          success: false,
          permission:
            'Notification' in window
              ? Notification.permission
              : 'unsupported',
          token: null,
          error: error
        };
      }
    },

    isSupported() {
      return (
        'Notification' in window &&
        'serviceWorker' in navigator
      );
    },

    getPermission() {
      if (!('Notification' in window)) {
        return 'unsupported';
      }

      return Notification.permission;
    }
  };

  window.MCNotifications = MCNotifications;

})(window);
