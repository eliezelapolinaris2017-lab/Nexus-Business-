# Nexus Business PR SaaS V4 Industry Locked

Versión enfocada en SaaS multiindustria real.

## Cambios clave
- El panel lateral cambia por industria.
- Dashboard, logo, títulos, formularios y reportes cambian según industria.
- No se muestran rastros de otros servicios si se selecciona una industria.
- Reportes y facturas tienen preview antes de imprimir o descargar.
- Planes usan enlaces de pago definidos en `payment-links.js`, no editables desde el SaaS.
- Firestore separado por usuario: `/users/{uid}/...`.

## Firebase
Activa Authentication Email/Password.
Copia `firestore.rules` en Firestore Rules.

## Pago
Edita `payment-links.js` con tus links reales de Stripe Payment Links, ATH/checkout externo o página de contacto.
Nota: en GitHub Pages el frontend es público. Para ocultar lógica sensible de pagos usa Firebase Functions o backend.
