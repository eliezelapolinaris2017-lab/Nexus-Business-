# Nexus Business PR SaaS V3 Enterprise

Plataforma SaaS multi-servicios para negocios en Puerto Rico.

## Requisitos Firebase
1. Authentication > Email/Password > Enable
2. Firestore Database > Rules > copiar `firestore.rules`
3. Publicar en GitHub Pages con `index.html`, `styles.css`, `app.js` y `firestore.rules`

## Estructura de datos
Cada usuario guarda su empresa privada en:

`tenants/{uid}`

Incluye:
- settings
- clients
- workers
- assets
- services
- invoices
- payments
- cashflow
- activity

## Planes
Los planes están en el frontend y se enlazan con enlaces externos de pago configurables:
- Starter
- Pro
- Business

Puedes usar Stripe Payment Links, ATH Móvil Business link, PayPal checkout u otra plataforma externa.

## Industrias incluidas
- Transporte
- HVAC / Refrigeración
- Handyman
- Construcción liviana
- Limpieza
- Salón / Barbería
- Mecánica móvil
- Landscaping

