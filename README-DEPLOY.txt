M.C Marketplace V4.0.1
DEPLOYMENT NOTES

Project: M.C Marketplace
Repository: milleclatcorpgroup5-web/MC-MARKETPLACE
Branch: main

Frontend directory:
public/

Cloudflare configuration:
wrangler.jsonc

Required frontend files:
- index.html
- produit.html
- commande.html
- vendeur.html
- admin.html
- boutique.html
- _headers
- _redirects

Required icons:
- icons/icon-192.png
- icons/icon-512.png

Payment:
Deferred / not configured.

Deployment verification:
1. Verify all required files are committed to main.
2. Verify wrangler.jsonc is at repository root.
3. Verify frontend files are inside public/.
4. Verify icons are inside public/icons/.
5. Verify Cloudflare deployment configuration before production deployment.
6. Do not enable payment functionality until it is explicitly configured and tested.

Version:
V4.0.1
