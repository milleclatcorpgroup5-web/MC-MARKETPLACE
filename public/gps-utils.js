// M.C Marketplace — GPS Utilities V4.0.1
// File: public/gps-utils.js
// Purpose:
// - Unified browser geolocation API
// - Compatible with commande.html and vendeur.html
// - No automatic infinite retry
// - Safe GPS data normalization
// - Optional reverse-geocoding hook
// - No external API dependency by default

(function (window, navigator) {
  "use strict";

  const VERSION = "4.0.1";

  const DEFAULTS = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 3000
  };

  const MOVING_SPEED_THRESHOLD = 0.5; // m/s

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function safeNumber(value) {
    return isFiniteNumber(value) ? value : null;
  }

  function normalizeOptions(options) {
    const input =
      options && typeof options === "object"
        ? options
        : {};

    const timeout =
      Number.isFinite(Number(input.timeout)) && Number(input.timeout) >= 0
        ? Number(input.timeout)
        : DEFAULTS.timeout;

    const maximumAge =
      Number.isFinite(Number(input.maximumAge)) && Number(input.maximumAge) >= 0
        ? Number(input.maximumAge)
        : DEFAULTS.maximumAge;

    return {
      enableHighAccuracy:
        input.enableHighAccuracy !== undefined
          ? Boolean(input.enableHighAccuracy)
          : DEFAULTS.enableHighAccuracy,

      timeout,
      maximumAge
    };
  }

  function normalizeError(error) {
    const code = error && Number.isFinite(error.code)
      ? error.code
      : 0;

    let message = "Impossible de récupérer la position GPS.";

    switch (code) {
      case 1:
        message = "Permission GPS refusée.";
        break;

      case 2:
        message = "Position GPS indisponible.";
        break;

      case 3:
        message = "Délai GPS dépassé.";
        break;

      default:
        message = "Erreur inconnue du service GPS.";
        break;
    }

    const normalized = new Error(message);

    normalized.name = "MCGPSError";
    normalized.code = code;
    normalized.originalError = error || null;

    return normalized;
  }

  function validateCoordinates(latitude, longitude) {
    return (
      isFiniteNumber(latitude) &&
      isFiniteNumber(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  function emptyAddress() {
    return {
      fullAddress: "",
      country: "",
      department: "",
      city: "",
      neighborhood: "",
      street: "",
      houseNumber: ""
    };
  }

  function normalizeAddress(address) {
    const source =
      address && typeof address === "object"
        ? address
        : {};

    return {
      fullAddress:
        typeof source.fullAddress === "string"
          ? source.fullAddress.trim()
          : "",

      country:
        typeof source.country === "string"
          ? source.country.trim()
          : "",

      department:
        typeof source.department === "string"
          ? source.department.trim()
          : "",

      city:
        typeof source.city === "string"
          ? source.city.trim()
          : "",

      neighborhood:
        typeof source.neighborhood === "string"
          ? source.neighborhood.trim()
          : "",

      street:
        typeof source.street === "string"
          ? source.street.trim()
          : "",

      houseNumber:
        typeof source.houseNumber === "string"
          ? source.houseNumber.trim()
          : ""
    };
  }

  function buildGPSObject(position) {
    if (
      !position ||
      !position.coords ||
      !validateCoordinates(
        position.coords.latitude,
        position.coords.longitude
      )
    ) {
      throw new Error("Données GPS invalides.");
    }

    const coords = position.coords;

    const latitude = Number(coords.latitude);
    const longitude = Number(coords.longitude);

    const accuracy = safeNumber(coords.accuracy);
    const altitude = safeNumber(coords.altitude);
    const heading = safeNumber(coords.heading);
    const speed = safeNumber(coords.speed);

    let isMoving = false;

    if (isFiniteNumber(speed) && speed >= MOVING_SPEED_THRESHOLD) {
      isMoving = true;
    }

    return {
      lat: latitude,
      lng: longitude,

      latitude: latitude,
      longitude: longitude,

      accuracy: accuracy,
      altitude: altitude,
      heading: heading,
      speed: speed,

      isMoving: isMoving,

      capturedAt: new Date().toISOString(),

      address: emptyAddress()
    };
  }

  function locateDetailed(options) {
    return new Promise(function (resolve, reject) {
      if (!navigator || !navigator.geolocation) {
        const error = new Error(
          "La géolocalisation n'est pas disponible sur cet appareil."
        );

        error.name = "MCGPSUnavailableError";
        error.code = 2;

        reject(error);
        return;
      }

      const finalOptions = normalizeOptions(options);

      let completed = false;

      function success(position) {
        if (completed) return;

        completed = true;

        try {
          const gps = buildGPSObject(position);

          resolve(gps);
        } catch (error) {
          reject(error);
        }
      }

      function failure(error) {
        if (completed) return;

        completed = true;

        reject(normalizeError(error));
      }

      try {
        navigator.geolocation.getCurrentPosition(
          success,
          failure,
          finalOptions
        );
      } catch (error) {
        completed = true;

        const normalized = new Error(
          error && error.message
            ? error.message
            : "Impossible d'utiliser le GPS."
        );

        normalized.name = "MCGPSExceptionError";
        normalized.code = 0;
        normalized.originalError = error || null;

        reject(normalized);
      }
    });
  }

  function formatAddress(gps) {
    if (!gps || typeof gps !== "object") {
      return "";
    }

    const address = normalizeAddress(gps.address);

    if (address.fullAddress) {
      return address.fullAddress;
    }

    const parts = [];

    if (address.houseNumber && address.street) {
      parts.push(
        address.houseNumber + " " + address.street
      );
    } else if (address.street) {
      parts.push(address.street);
    }

    if (address.neighborhood) {
      parts.push(address.neighborhood);
    }

    if (address.city) {
      parts.push(address.city);
    }

    if (address.department) {
      parts.push(address.department);
    }

    if (address.country) {
      parts.push(address.country);
    }

    return parts
      .filter(Boolean)
      .join(", ");
  }

  function accuracyLabel(accuracy) {
    if (!isFiniteNumber(Number(accuracy))) {
      return "Précision GPS inconnue";
    }

    const value = Number(accuracy);

    if (value <= 5) {
      return "Précision GPS excellente";
    }

    if (value <= 15) {
      return "Précision GPS très bonne";
    }

    if (value <= 30) {
      return "Précision GPS bonne";
    }

    if (value <= 100) {
      return "Précision GPS moyenne";
    }

    if (value <= 500) {
      return "Précision GPS faible";
    }

    return "Précision GPS très faible";
  }

  function setAddress(gps, address) {
    if (!gps || typeof gps !== "object") {
      return gps;
    }

    gps.address = normalizeAddress(address);

    return gps;
  }

  function setReverseGeocoder(handler) {
    if (handler !== null && typeof handler !== "function") {
      throw new TypeError(
        "Le reverse geocoder doit être une fonction ou null."
      );
    }

    reverseGeocoder = handler;

    return true;
  }

  let reverseGeocoder = null;

  async function reverseGeocode(gps) {
    if (!gps || !validateCoordinates(gps.lat, gps.lng)) {
      return emptyAddress();
    }

    if (!reverseGeocoder) {
      return normalizeAddress(gps.address);
    }

    try {
      const result = await reverseGeocoder({
        lat: gps.lat,
        lng: gps.lng
      });

      const address = normalizeAddress(result);

      gps.address = address;

      return address;
    } catch (error) {
      // Reverse geocoding must never break GPS coordinates.
      return normalizeAddress(gps.address);
    }
  }

  const MCGPS = {
    version: VERSION,

    locateDetailed: locateDetailed,

    formatAddress: formatAddress,

    accuracyLabel: accuracyLabel,

    setAddress: setAddress,

    setReverseGeocoder: setReverseGeocoder,

    reverseGeocode: reverseGeocode,

    validateCoordinates: validateCoordinates,

    isSupported: function () {
      return !!(
        navigator &&
        navigator.geolocation &&
        typeof navigator.geolocation.getCurrentPosition === "function"
      );
    }
  };

  Object.defineProperty(MCGPS, "VERSION", {
    value: VERSION,
    enumerable: true,
    writable: false,
    configurable: false
  });

  window.MCGPS = MCGPS;

})(window, navigator);
