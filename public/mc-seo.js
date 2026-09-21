// M.C Marketplace V4.0.1
// mc-seo.js
// Lightweight SEO helper
// No payment logic / no Firebase dependency

(function (window, document) {
  'use strict';

  const MCSEO = {
    version: '4.0.1',

    setMeta(name, content) {
      if (!name || content == null) return false;

      let meta = document.querySelector(
        'meta[name="' + name + '"]'
      );

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', String(content));
      return true;
    },

    setProperty(property, content) {
      if (!property || content == null) return false;

      let meta = document.querySelector(
        'meta[property="' + property + '"]'
      );

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', String(content));
      return true;
    },

    init(options = {}) {
      const title =
        options.title ||
        document.title ||
        'M.C Marketplace — Achte lokal, resevwa vit';

      const description =
        options.description ||
        document.querySelector('meta[name="description"]')?.content ||
        'M.C Marketplace — marketplace ayisyen pou achte pwodwi ak sèvis lokal.';

      const url =
        options.url ||
        window.location.href;

      document.title = title;

      this.setMeta('description', description);

      this.setProperty('og:title', title);
      this.setProperty('og:description', description);
      this.setProperty('og:url', url);
      this.setProperty('og:type', options.type || 'website');

      return true;
    }
  };

  window.MCSEO = MCSEO;

  try {
    MCSEO.init();
  } catch (error) {
    console.warn(
      'MCSEO initialization failed:',
      error
    );
  }

})(window, document);
