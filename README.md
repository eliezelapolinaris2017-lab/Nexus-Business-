# Nexus Business PR

Plataforma SaaS empresarial para servicios, cotizaciones, facturación, cobros, reportes y seguimiento postventa.

## V50
- Base limpia v48D.
- Seguimiento de mantenimientos cada 6 meses.
- Seguimiento de cotizaciones e instalaciones.
- Report Center filtrado por fechas.



## v51 Mobile Operations

Se añadió una versión móvil independiente para iPhone y iPad:

- Abrir `mobile.html`.
- Usa la misma cuenta Firebase y la misma data de clientes, facturas, cobros, servicios, cotizaciones y seguimientos.
- Dashboard móvil enfocado en facturación.
- Área de Seguimientos con mantenimientos estándar cada 6 meses.
- Nueva factura móvil con tipo de factura: Servicio, Mantenimiento, Instalación, Diagnóstico, Cotización u Otro.
- Historial compartido por cliente.
- Sync en tiempo real con `onSnapshot`.
- Service worker `sw.js` y `manifest.webmanifest` para experiencia tipo app en iPhone/iPad.

Para instalar en iPhone/iPad: abrir `mobile.html` en Safari, compartir y seleccionar “Añadir a pantalla de inicio”.

## v52 Nexus Mobile PWA

Esta versión convierte `mobile.html` en una PWA más completa para iPhone y iPad.

- Instalación desde Safari con “Añadir a pantalla de inicio”.
- Misma data Firebase del panel principal.
- Dashboard móvil enfocado en facturación.
- KPIs por tipo de factura: Servicio, Mantenimiento, Instalación, Diagnóstico, Cotización y Otro.
- Área de Seguimientos con mantenimiento estándar cada 6 meses.
- Historial compartido de facturas, cobros, servicios y seguimientos.
- Sync en tiempo real con `onSnapshot`.
- Service worker v52 con cache controlado y auto actualización.
- Botón “Buscar actualización” en la pestaña Sync.
